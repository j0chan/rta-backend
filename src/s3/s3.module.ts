import { Module } from '@nestjs/common'
import { S3Service } from './s3.service'
import { S3Controller } from './s3.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Image } from './entities/images.entity'
import { Review } from 'src/reviews/entites/review.entity'
import { ReviewImage } from './entities/review-image.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Image, Review, ReviewImage]),
    ],
    providers: [S3Service],
    controllers: [S3Controller],
    exports: [S3Service],
})
export class S3Module { }