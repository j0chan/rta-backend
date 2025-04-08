import { Controller, Post, UploadedFile, UseInterceptors, Param, Get, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from './file.service'
import { UploadType } from './entities/upload-type.enum'

@Controller('api/s3')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    // @Post('/upload/review/:review_id')
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadReviewImage(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Param('review_id') review_id: number,
    // ) {
    //     const review_image = await this.s3Service.uploadReviewImages(file, review_id)

    //     return { message: 'Review Image Uploaded', image: review_image.image }
    // }

    // @Post('/upload')
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadImage(@UploadedFile() file: Express.Multer.File) {
    //     // 임시 이미지 타입. 추후 body를 통해 정확한 이미지 타입 전송
    //     const image_type = UploadType.USER_PROFILE

    //     const url = await this.s3Service.uploadImage(file.buffer, file.originalname, file.mimetype, image_type)
    //     return { message: 'File uploaded successfully', url }
    // }

    @Get('/download/:file_name')
    async getImage(@Param('file_name') file_name: string): Promise<{ url: string }> {
        const foundImageUrl = await this.fileService.getImage(file_name)
        return { url: foundImageUrl }
    }

    @Delete('/delete/:file_name')
    async deleteImage(@Param('file_name') file_name: string) {
        const message = await this.fileService.deleteImage(file_name)
        return { message }
    }
}
