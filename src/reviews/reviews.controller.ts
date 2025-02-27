import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common'
import { CreateReviewRequestDTO } from './DTO/create-review-request.dto'
import { ReadAllReviewsRequestDTO } from './DTO/read-all-reviews-request.dto'
import { Event } from 'src/events/entities/event.entity'
import { Review } from './entites/review.entity'
import { UpdateReviewRequestDTO } from './DTO/update-review-request.dto'

@Controller('api/reviews')
export class ReviewsController {

    // 생성자 정의
    constructor(private reviewsService: ReviewsService) { }

    // CREATE - 리뷰 작성
    // 미구현: logger
    @Post('/')
    async createReview(@Body() createReviewRequestDTO: CreateReviewRequestDTO): Promise<ApiResponseDto<Event>> {
        await this.reviewsService.createReview(createReviewRequestDTO)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Review Created Successfully!')
    }

    // READ - 모든 리뷰 조회
    // 미구현: logger
    @Get('/')
    async readAllReviews(): Promise<ApiResponseDto<ReadAllReviewsRequestDTO[]>> {
        const reviews: Review[] = await this.reviewsService.readAllReviews()
        const readAllReviewsRequestDTO = reviews.map(review => new ReadAllReviewsRequestDTO(review))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Review List!', readAllReviewsRequestDTO)
    }

    // UPDATE[1] - 리뷰 수정
    // 미구현: logger
    @Put('/:review_id')
    async updateReviewByReviewId(
        @Param('review_id') review_id: number,
        @Body() updateReviewRequestDTO: UpdateReviewRequestDTO): Promise<ApiResponseDto<void>> {
        await this.reviewsService.updateReviewByReviewId(review_id, updateReviewRequestDTO)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Review Updated Successfully!')
    }

    // UPDATE[2] - 리뷰 도움됐어요 반응
    // 미구현: logger
    /**
     * 비고
     * 한번만 누를 수 있게, 취소는 불가능
     * 취소 되게하려면 복잡해지기 때문에 일단 이렇게
     */
    @Patch('/:review_id/helpful')
    async markHelpful(
        @Param("review_id") review_id: number): Promise<ApiResponseDto<void>> {
        await this.reviewsService.markHelpful(review_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Reaction Applied Successfully!')
    }

    // DELETE - 리뷰 삭제
    // 미구현: logger
    @Delete('/:review_id')
    async deleteReviewByReviewId(@Param('review_id') review_id: number): Promise<ApiResponseDto<void>> {
        await this.reviewsService.deleteReveiwById(review_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Review Deleted Successfully!');
    }

}
