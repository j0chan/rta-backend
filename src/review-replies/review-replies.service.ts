import { ReviewsService } from './../reviews/reviews.service'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateReviewReplyDTO } from './DTO/create-review-reply.dto'
import { ReviewReply } from './entities/review-reply.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ReviewRepliesService {

    constructor(
        // ReviewReply 엔터티 주입
        @InjectRepository(ReviewReply)
        private reviewReplyRepository: Repository<ReviewReply>,

        private reviewsService: ReviewsService,
    ) { }

    // CREATE
    // 미구현: logger, 에러 처리
    async createReviewReply(review_id: number, CreateReviewReplyDTO: CreateReviewReplyDTO): Promise<ReviewReply> {
        const foundReview = await this.reviewsService.readReviewById(review_id)

        if (!foundReview) {
            throw new NotFoundException(`Cannot found review_id: ${review_id}`)
        }

        if (foundReview.reply) {
            throw new ForbiddenException('이미 매니저 대댓글이 등록되어 있습니다.')
        }

        const currentDate = await new Date()

        const newReviewReply: ReviewReply = this.reviewReplyRepository.create({
            content: CreateReviewReplyDTO.content,
            created_at: currentDate,
            updated_at: currentDate,
            review: foundReview,
        })

        const createdReviewReply: ReviewReply = await this.reviewReplyRepository.save(newReviewReply)

        return createdReviewReply
    }
}
