import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { Review } from './entites/review.entity'
import { StoresModule } from 'src/stores/stores.module'
import { ReviewRepliesModule } from 'src/review-replies/review-replies.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        StoresModule,
        ReviewRepliesModule,
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController],
    exports: [ReviewsModule]
})
export class ReviewsModule { }