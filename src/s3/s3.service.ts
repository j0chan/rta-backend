import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { Readable } from 'typeorm/platform/PlatformTools'
import { Image } from './entities/images.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

dotenv.config()
@Injectable()
export class S3Service {
    s3Client: S3Client
    private bucketName: string

    constructor(
        @InjectRepository(Image)
        private imageRepository: Repository<Image>,
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
    async uploadFile(fileBuffer: Buffer, file_name: string, content_type: string): Promise<Image> {
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
        })

        return await this.imageRepository.save(image)
    }

    // 파일 다운로드
    async getFile(file_name: string): Promise<Buffer> {
        const getParams = {
            Bucket: this.bucketName,
            Key: file_name,
        }

        const { Body } = await this.s3Client.send(new GetObjectCommand(getParams))

        // Body가 ReadableStream일 경우 Buffer로 변환
        if (Body instanceof Readable) {
            return new Promise((resolve, reject) => {
                const chunks: any[] = []
                Body.on('data', (chunk) => chunks.push(chunk))
                Body.on('end', () => resolve(Buffer.concat(chunks)))
                Body.on('error', reject)
            })
        }

        throw new Error('File not found')
    }

    // 파일 삭제
    async deleteFile(file_name: string): Promise<string> {
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