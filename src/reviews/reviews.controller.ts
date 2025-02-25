import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common'
import { CreateReviewRequestDTO } from './DTO/create-review-request.dto'
import { ReadAllReviewsRequestDTO } from './DTO/read-all-reviews-request.dto'
import { Event } from 'src/events/entities/event.entity'
import { Review } from './entites/review.entity'

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


    // UPDATE
    // 미구현: logger



    // DELETE
    // 미구현: logger
}
