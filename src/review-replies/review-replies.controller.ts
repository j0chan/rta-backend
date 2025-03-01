import { ReviewRepliesService } from './review-replies.service'
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common'
import { CreateReviewReplyDTO } from './DTO/create-review-reply.dto'
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewReply } from './entities/review-reply.entity'
import { ReadAllRepliesDTO } from './DTO/read-all-replies.dto'

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

    // READ[1] - 모든 대댓글 조회 (매니저 전용)
    // 미구현: logger
    @Get('/')
    async readAllReviews(): Promise<ApiResponseDto<ReadAllRepliesDTO[]>> {
        const reviewReplies: ReviewReply[] = await this.reviewRepliesService.readAllReviewReplies()
        const readAllRepliesDTO = reviewReplies.map(reply => new ReadAllRepliesDTO(reply))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Review Reply List!', readAllRepliesDTO)
    }

    // READ[2] - 특정 리뷰 조회
    // 미구현: looger
    @Get('/:reply_id')
    async readReviewReplyById(@Param('reply_id') reply_id: number): Promise<ApiResponseDto<ReviewReply>> {
        const foundReply: ReviewReply = await this.reviewRepliesService.readReviewReplyById(reply_id)
        
        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Review Reply!', foundReply)
    }
}
