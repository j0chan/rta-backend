import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { Image } from './entities/images.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ImageType } from './entities/image-type.enum'
import { ReviewImage } from './entities/review-image.entity'
import { Review } from 'src/reviews/entites/review.entity'

dotenv.config()
@Injectable()
export class S3Service {
    s3Client: S3Client
    private bucketName: string

    constructor(
        @InjectRepository(Image)
        private imageRepository: Repository<Image>,
        @InjectRepository(ReviewImage)
        private reviewImageRepository: Repository<ReviewImage>,
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY
        const region = process.env.AWS_REGION
        this.bucketName = String(process.env.AWS_S3_BUCKET)

        if (!accessKeyId || !secretAccessKey || !region || !this.bucketName) {
            throw new Error('Missing AWS S3 environment variables')
        }

        // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
        this.s3Client = new S3Client({
            region: region, // AWS Region
            credentials: {
                accessKeyId: accessKeyId, // Access Key
                secretAccessKey: secretAccessKey, // Secret Key
            },
        })
    }

    // 리뷰 이미지 업로드
    async uploadReviewImages(file: Express.Multer.File, review_id: number): Promise<ReviewImage> {
        const review = await this.reviewRepository.findOne({ where: { review_id: review_id } })
        if (!review) throw new Error('Review not found')

        const uploadParamas = {
            Bucket: this.bucketName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        }

        await this.s3Client.send(new PutObjectCommand(uploadParamas))

        const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}`

        // image 저장
        const image = this.imageRepository.create({
            file_name: file.originalname,
            url,
            content_type: file.mimetype,
            image_type: ImageType.REVIEW_IMAGE
        })
        const savedImage = await this.imageRepository.save(image)

        // reviewImage에 매핑 저장
        const reviewImage = this.reviewImageRepository.create({
            review,
            image: savedImage,
        })

        return await this.reviewImageRepository.save(reviewImage)
    }

    // 파일 업로드
    async uploadImage(fileBuffer: Buffer, file_name: string, content_type: string, image_type: ImageType): Promise<Image> {
        const uploadParamas = {
            Bucket: this.bucketName,
            Key: file_name,
            Body: fileBuffer,
            ContentType: content_type,
        }

        await this.s3Client.send(new PutObjectCommand(uploadParamas))

        const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file_name}`

        // DB에 저장
        const image = this.imageRepository.create({
            file_name,
            url,
            content_type,
            image_type,
        })

        return await this.imageRepository.save(image)
    }

    // 파일 다운로드
    async getImage(file_name: string): Promise<string> {
        const image = await this.imageRepository.findOne({ where: { file_name } })

        if (!image) {
            throw new Error('File Not Found.')
        }

        return image.url
    }

    // 파일 삭제
    async deleteImage(file_name: string): Promise<string> {
        const deleteParams = {
            Bucket: this.bucketName,
            Key: file_name,
        }

        await this.s3Client.send(new DeleteObjectCommand(deleteParams))

        // DB에서 삭제
        await this.imageRepository.delete({ file_name })

        return `File ${file_name} deleted successfully`
    }
}