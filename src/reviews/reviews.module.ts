import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { Review } from './entites/review.entity'
import { StoresModule } from 'src/stores/stores.module'
import { ReviewReply } from './entites/review-reply.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, ReviewReply]),
        StoresModule,
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController],
})
export class ReviewsModule { }