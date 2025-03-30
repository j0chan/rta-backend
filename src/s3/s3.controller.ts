import { Controller, Post, UploadedFile, UseInterceptors, Param, Get, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from './s3.service'

@Controller('api/s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const url = await this.s3Service.uploadFile(file.buffer, file.originalname, file.mimetype)
        return { message: 'File uploaded successfully', url }
    }

    @Get('/download/:fileName')
    async getFile(@Param('fileName') fileName: string) {
        const fileBuffer = await this.s3Service.getFile(fileName)
        return fileBuffer
    }

    @Delete('/delete/:fileName')
    async deleteFile(@Param('fileName') fileName: string) {
        const message = await this.s3Service.deleteFile(fileName)
        return { message }
    }
}
