import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common'
import { CreateReviewDTO } from './DTO/create-review.dto'
import { Review } from './entites/review.entity'
import { UpdateReviewDTO } from './DTO/update-review.dto'
import { ReadReviewDTO } from './DTO/read-review.dto'

@Controller('api/reviews')
export class ReviewsController {

    // 생성자 정의
    constructor(private reviewsService: ReviewsService) { }

    // CREATE - 리뷰 작성
    // 미구현: logger
    // @Post('/')
    // async createReview(@Body() createReviewDTO: CreateReviewDTO): Promise<ApiResponseDTO<Review>> {
    //     await this.reviewsService.createReview(createReviewDTO)
    //     return new ApiResponseDTO(true, HttpStatus.CREATED, 'Review Created Successfully!')
    // }

    // READ[1] - 모든 리뷰 조회
    // 미구현: logger
    @Get('/')
    async readAllReviews(): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const reviews: Review[] = await this.reviewsService.readAllReviews()
        const readReviewDTO = reviews.map(review => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Reviews Retrieved Successfully', readReviewDTO)
    }

    // READ[2] - 특정 리뷰 조회
    // 미구현: looger
    @Get('/:review_id')
    async readReviewById(@Param('review_id') review_id: number): Promise<ApiResponseDTO<Review>> {
        const foundReview: Review = await this.reviewsService.readReviewById(review_id)
        
        return new ApiResponseDTO(true, HttpStatus.OK, 'Successfully Retrieved Review!', foundReview)
    }

    // UPDATE[1] - 리뷰 수정
    // 미구현: logger
    @Put('/:review_id')
    async updateReviewByReviewId(
        @Param('review_id') review_id: number,
        @Body() updateReviewDTO: UpdateReviewDTO): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.updateReviewByReviewId(review_id, updateReviewDTO)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Review Updated Successfully!')
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
        @Param("review_id") review_id: number): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.markHelpful(review_id)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Reaction Applied Successfully!')
    }

    // DELETE - 리뷰 삭제
    // 미구현: logger
    @Delete('/:review_id')
    async deleteReviewByReviewId(@Param('review_id') review_id: number): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.deleteReveiwById(review_id)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Review Deleted Successfully!');
    }
}
