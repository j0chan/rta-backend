import { Controller, Post, UploadedFile, UseInterceptors, Param, Get, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from './s3.service'
import { ImageType } from './entities/image-type.enum'

@Controller('api/s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) { }

    @Post('/upload/review/:review_id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadReviewImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('review_id') review_id: number,
    ) {
        const review_image = await this.s3Service.uploadReviewImages(file, review_id)

        return { message: 'Review Image Uploaded', image: review_image.image }
    }

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        // 임시 이미지 타입. 추후 body를 통해 정확한 이미지 타입 전송
        const image_type = ImageType.USER_PROFILE

        const url = await this.s3Service.uploadImage(file.buffer, file.originalname, file.mimetype, image_type)
        return { message: 'File uploaded successfully', url }
    }

    @Get('/download/:file_name')
    async getImage(@Param('file_name') file_name: string): Promise<{ url: string }> {
        const foundImageUrl = await this.s3Service.getImage(file_name)
        return { url: foundImageUrl }
    }

    @Delete('/delete/:file_name')
    async deleteImage(@Param('file_name') file_name: string) {
        const message = await this.s3Service.deleteImage(file_name)
        return { message }
    }
}
