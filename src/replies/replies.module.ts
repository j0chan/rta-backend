import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reply } from './entities/reply.entity'
import { RepliesService } from './replies.service'
import { RepliesController } from './replies.controller'
import { ReviewsModule } from 'src/reviews/reviews.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([Reply]),
        ReviewsModule,
    ],
    providers: [RepliesService],
    controllers: [RepliesController],
})
export class RepliesModule { }
