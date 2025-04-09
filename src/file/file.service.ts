import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { File } from './entities/file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UploadType } from './entities/upload-type.enum'
import { Review } from 'src/reviews/entites/review.entity'
import { v4 as uuidv4 } from 'uuid'
import { Store } from 'src/stores/entities/store.entity'
import { User } from 'src/users/entities/user.entity'
import { Event } from 'src/events/entities/event.entity'

dotenv.config()

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name)

    s3Client: S3Client
    private bucketName: string

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
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

    // 파일 업로드
    async uploadImage(
        files: Express.Multer.File[],
        targetEntity: Review | Store | User | Event,
        uploadType: UploadType
    ): Promise<File[]> {
        this.logger.log(`uploadImage START`)

        const uploadedFiles: File[] = []

        try {
            for (const file of files) {
                // uuid를 통해 파일명 중복 방지
                const uuid = uuidv4()

                // 파일 확장자 추출
                const ext = path.extname(file.originalname)

                // S3에 저장될 최종 파일 이름
                const folderPrefix = this.getFolderByUploadType(uploadType)
                const s3FileName = `${folderPrefix}/${uuid}${ext}`

                // S3에 업로드 할 객체
                const uploadParams = {
                    Bucket: this.bucketName,
                    Key: s3FileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }
                await this.s3Client.send(new PutObjectCommand(uploadParams))

                const region = process.env.AWS_REGION

                // DB에 저장할 url / 파일명(한글깨짐) 생성
                const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3FileName}`
                const dbFileName = file.originalname

                // DB에 저장
                const fileData: Partial<File> = {
                    file_name: dbFileName,
                    url: url,
                    content_type: file.mimetype,
                    upload_type: uploadType,
                }
                switch (uploadType) {
                    case UploadType.REVIEW_IMAGE:
                        fileData.review = targetEntity as Review
                        break
                    // 추후 구현 완료 시 주석 해제
                    // case UploadType.STORE_PROFILE:
                    //     fileData.store = targetEntity as Store
                    //     break
                    // case UploadType.USER_PROFILE:
                    //     fileData.user = targetEntity as User
                    //     break
                    // case UploadType.EVENT_IMAGE:
                    //     fileData.event = targetEntity as Event
                    //     break
                    default:
                        this.logger.warn(`Unknown upload type: ${uploadType}`)
                }
                const fileEntity = this.fileRepository.create(fileData)

                const savedFile = await this.fileRepository.save(fileEntity)
                uploadedFiles.push(savedFile)
            }
        } catch (error) {
            this.logger.error('Error uploading images:', error)
            throw new Error('Failed to upload images')
        }

        this.logger.log(`uploadImage END`)
        return uploadedFiles
    }

    // 파일 삭제
    async deleteImage(file_name: string): Promise<string> {
        this.logger.log(`deleteImage START`)

        const deleteParams = {
            Bucket: this.bucketName,
            Key: file_name,
        }

        await this.s3Client.send(new DeleteObjectCommand(deleteParams))

        // DB에서 삭제
        await this.fileRepository.delete({ file_name })

        this.logger.log(`deleteImage END`)
        return `File ${file_name} deleted successfully`
    }

    private getFolderByUploadType(uploadType: UploadType): string {
        switch (uploadType) {
            case UploadType.REVIEW_IMAGE:
                return 'review'
            case UploadType.USER_PROFILE:
                return 'user_profile'
            case UploadType.STORE_PROFILE:
                return 'store'
            case UploadType.EVENT_IMAGE:
                return 'event'
            default:
                return 'etc'
        }
    }
}
