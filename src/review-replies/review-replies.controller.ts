import { ReviewRepliesService } from './review-replies.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { CreateReplyDTO } from './DTO/create-reply.dto'
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewReply } from './entities/review-reply.entity'
import { ReadAllRepliesDTO } from './DTO/read-all-replies.dto'
import { UpdateReplyDTO } from './DTO/upate-reply.dto'

@Controller('api/reviews')
export class ReviewRepliesController {

    // 생성자 정의
    constructor(private reviewRepliesService: ReviewRepliesService) { }

    // CREATE - 리뷰 대댓글 (매니저 전용)
    // 미구현: logger
    // 비고: 매니저 여부를 판단하는 guard 必
    @Post('/:review_id/reply')
    async createReply(
        @Param('review_id') review_id: number,
        @Body() createReplyDTO: CreateReplyDTO): Promise<ApiResponseDto<ReviewReply>> {
        await this.reviewRepliesService.createReply(review_id, createReplyDTO)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Review Reply Created Successfully!')
    }

    // READ[1] - 모든 대댓글 조회 (매니저 전용)
    // 미구현: logger
    @Get('/')
    async readAllReplies(): Promise<ApiResponseDto<ReadAllRepliesDTO[]>> {
        const reviewReplies: ReviewReply[] = await this.reviewRepliesService.readAllReplies()
        const readAllRepliesDTO = reviewReplies.map(reply => new ReadAllRepliesDTO(reply))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Review Reply List!', readAllRepliesDTO)
    }

    // READ[2] - 특정 대댓글 조회
    // 미구현: looger
    @Get('/:reply_id')
    async readReplyById(@Param('reply_id') reply_id: number): Promise<ApiResponseDto<ReviewReply>> {
        const foundReply: ReviewReply = await this.reviewRepliesService.readReplyById(reply_id)

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Review Reply!', foundReply)
    }

    // UPDATE - 리뷰 수정
    // 미구현: logger
    @Put('/:reply_id')
    async updateReplyByReplyId(
        @Param('reply_id') reply_id: number,
        @Body() updateReplyDTO: UpdateReplyDTO): Promise<ApiResponseDto<void>> {
        await this.reviewRepliesService.updateReplyByReplyId(reply_id, updateReplyDTO)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Reply Updated Successfully!')
    }

    // DELETE - 대댓글 삭제
    // 미구현: logger
    @Delete('/:reply_id')
    async deleteReplyByReplyId(@Param('reply_id') reply_id: number): Promise<ApiResponseDto<void>> {
        await this.reviewRepliesService.deleteReplyByReplyId(reply_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Reply Deleted Successfully!');
    }
}
