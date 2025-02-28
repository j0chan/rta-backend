import { ReviewRepliesService } from './review-replies.service'
import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common'
import { CreateReviewReplyDTO } from './DTO/create-review-reply.dto'
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewReply } from './entities/review-reply.entity'

@Controller('api/reviews')
export class ReviewRepliesController {

    // 생성자 정의
    constructor(private reviewRepliesService: ReviewRepliesService) { }

    // CREATE - 리뷰 대댓글 (매니저 전용)
    // 미구현: logger
    // 비고: 매니저 여부를 판단하는 guard 必
    @Post('/:review_id/reply')
    async createReviewReply(
        @Param('review_id') review_id: number,
        @Body() CreateReviewReplyDTO: CreateReviewReplyDTO): Promise<ApiResponseDto<ReviewReply>> {
        await this.reviewRepliesService.createReviewReply(review_id, CreateReviewReplyDTO)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Review Reply Created Successfully!')
    }
}
