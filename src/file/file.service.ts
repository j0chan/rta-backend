import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadType } from './entities/upload-type.enum';
import { Review } from 'src/reviews/entites/review.entity';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

dotenv.config();

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name); // Logger 추가

    s3Client: S3Client;
    private bucketName: string;

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        this.bucketName = String(process.env.AWS_S3_BUCKET);

        if (!accessKeyId || !secretAccessKey || !region || !this.bucketName) {
            throw new Error('Missing AWS S3 environment variables');
        }

        // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
        this.s3Client = new S3Client({
            region: region, // AWS Region
            credentials: {
                accessKeyId: accessKeyId, // Access Key
                secretAccessKey: secretAccessKey, // Secret Key
            },
        });
    }

    // 파일 업로드 (여러 파일 처리)
    async uploadImage(files: Express.Multer.File[], createdReview: Review): Promise<File[]> {
        const uploadedFiles: File[] = [];

        try {
            for (const file of files) {
                // Generate unique filename using UUID and original filename
                const uuid = uuidv4();
                const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'); // Remove special characters
                const fileExtension = file.originalname.split('.').pop() || 'unknown'; // 확장자 예외 처리
                const filename = `${uuid}_${originalName}.${fileExtension}`;

                const uploadParams = {
                    Bucket: this.bucketName,
                    Key: filename, // Use filename with UUID and original name
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };

                await this.s3Client.send(new PutObjectCommand(uploadParams));

                const region = process.env.AWS_REGION || 'your-default-region'; // Region 기본값 설정
                const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${filename}`;

                // DB에 저장
                const fileEntity = this.fileRepository.create({
                    file_name: filename, // Store filename with UUID and original name
                    url: url,
                    content_type: file.mimetype,
                    upload_type: UploadType.REVIEW_IMAGE, // Assuming the upload type is REVIEW_IMAGE
                    review: createdReview, // Connect to the review
                });

                const savedFile = await this.fileRepository.save(fileEntity);
                uploadedFiles.push(savedFile);
            }
        } catch (error) {
            this.logger.error('Error uploading images:', error); // Logger를 사용하여 에러 로깅
            throw new Error('Failed to upload images'); // 에러를 상위로 던져서 처리
        }

        return uploadedFiles;
    }

    // 파일 다운로드
    async getImage(file_name: string): Promise<string> {
        const image = await this.fileRepository.findOne({ where: { file_name } });

        if (!image) {
            throw new Error('File Not Found.');
        }

        return image.url;
    }

    // 파일 삭제
    async deleteImage(file_name: string): Promise<string> {
        const deleteParams = {
            Bucket: this.bucketName,
            Key: file_name,
        };

        await this.s3Client.send(new DeleteObjectCommand(deleteParams));

        // DB에서 삭제
        await this.fileRepository.delete({ file_name });

        return `File ${file_name} deleted successfully`;
    }
}
