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

    @Get('/download/:file_name')
    async getFile(@Param('fileName') file_name: string) {
        const fileBuffer = await this.s3Service.getFile(file_name)
        return fileBuffer
    }

    @Delete('/delete/:file_name')
    async deleteFile(@Param('file_name') file_name: string) {
        const message = await this.s3Service.deleteFile(file_name)
        return { message }
    }
}
