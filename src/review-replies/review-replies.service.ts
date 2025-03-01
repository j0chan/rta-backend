import { ReviewsService } from './../reviews/reviews.service'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateReplyDTO } from './DTO/create-reply.dto'
import { ReviewReply } from './entities/review-reply.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateReplyDTO } from './DTO/upate-reply.dto'

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
    async createReply(review_id: number, createReplyDTO: CreateReplyDTO): Promise<ReviewReply> {
        const foundReview = await this.reviewsService.readReviewById(review_id)

        if (!foundReview) {
            throw new NotFoundException(`Cannot found review_id: ${review_id}`)
        }

        if (foundReview.reply) {
            throw new ForbiddenException('Reply already exists for this review.')
        }

        const currentDate = await new Date()

        const newReviewReply: ReviewReply = this.reviewReplyRepository.create({
            content: createReplyDTO.content,
            created_at: currentDate,
            updated_at: currentDate,
            review: foundReview,
        })

        const createdReply: ReviewReply = await this.reviewReplyRepository.save(newReviewReply)

        // review엔터티의 reply컬럼 변경 수행
        await this.reviewsService.updateReviewReplyId(review_id, createdReply)

        return createdReply
    }

    // READ[1] - 모든 대댓글 조회 (매니저 전용)
    // 미구현: logger, 에러 처리
    async readAllReplies(): Promise<ReviewReply[]> {

        const foundReplies = await this.reviewReplyRepository.find()

        return foundReplies
    }

    // READ[2] - 특정 리뷰 조회
    // 미구현: logger, 에러 처리
    async readReplyById(reply_id: number): Promise<ReviewReply> {
        const foundReply = await this.reviewReplyRepository.findOneBy({ reply_id })

        if (!foundReply) {
            throw new NotFoundException(`Cannot Find reply_id: ${reply_id}`)
        }

        return foundReply
    }

    // UPDATE[1] - 리뷰 수정
    // 미구현: logger, 에러 처리
    async updateReplyByReplyId(reply_id: number, updateReviewDTO: UpdateReplyDTO) {
        const foundReply = await this.readReplyById(reply_id)

        if (!foundReply) {
            throw new NotFoundException(`Cannot Find review_id: ${reply_id}`)
        }

        const currentDate: Date = await new Date()

        foundReply.content = updateReviewDTO.content
        foundReply.updated_at = currentDate

        await this.reviewReplyRepository.save(foundReply)
    }

    // DELETE - 대댓글 삭제
    // 미구현: logger, 에러 처리
    async deleteReplyByReplyId(reply_id: number) {
        const foundReply = await this.readReplyById(reply_id)

        await this.reviewReplyRepository.remove(foundReply)
    }
}
