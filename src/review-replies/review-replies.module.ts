import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewReply } from './entities/review-reply.entity'
import { StoresModule } from 'src/stores/stores.module'
import { ReviewRepliesService } from './review-replies.service'
import { ReviewRepliesController } from './review-replies.controller'
import { ReviewsModule } from 'src/reviews/reviews.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([ReviewReply]),
        StoresModule,
        ReviewsModule,
    ],
    providers: [ReviewRepliesService],
    controllers: [ReviewRepliesController]
})
export class ReviewRepliesModule {}
