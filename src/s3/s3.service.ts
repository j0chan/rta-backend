import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as dotenv from 'dotenv'
import { Readable } from 'typeorm/platform/PlatformTools'

dotenv.config()
@Injectable()
export class S3Service {
    s3Client: S3Client
    private bucketName: string

    constructor(private configService: ConfigService) {
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
    async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        const uploadParamas = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        }

        await this.s3Client.send(new PutObjectCommand(uploadParamas))

        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    }

    // 파일 DB에 저장
    async save() {

    }

    // 파일 다운로드
    async getFile(fileName: string): Promise<Buffer> {
        const getParams = {
            Bucket: this.bucketName,
            Key: fileName,
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
    async deleteFile(fileName: string): Promise<string> {
        const deleteParams = {
            Bucket: this.bucketName,
            Key: fileName,
        }

        await this.s3Client.send(new DeleteObjectCommand(deleteParams))
        return `File ${fileName} deleted successfully`
    }
}