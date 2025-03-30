import { Controller, Post, UploadedFile, UseInterceptors, Param, Get, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from './s3.service'

@Controller('api/s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const url = await this.s3Service.uploadImage(file.buffer, file.originalname, file.mimetype)
        return { message: 'File uploaded successfully', url }
    }

    @Get('/download/:file_name')
    async getImage(@Param('fileName') file_name: string): Promise<string> {
        const foundImageUrl = await this.s3Service.getImage(file_name)
        return foundImageUrl
    }

    @Delete('/delete/:file_name')
    async deleteImage(@Param('file_name') file_name: string) {
        const message = await this.s3Service.deleteImage(file_name)
        return { message }
    }
}
