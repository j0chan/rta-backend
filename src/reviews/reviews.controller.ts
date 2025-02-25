import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { CreateReviewRequestDTO } from './DTO/create-review-request.dto'

@Controller('api/reviews')
export class ReviewsController {

    // 생성자 정의
    constructor(private reviewsService: ReviewsService) { }

    // CREATE
    // 미구현: logger
    @Post('/')
    async createReview(@Body() createReviewRequestDTO: CreateReviewRequestDTO): Promise<ApiResponseDto<Event>> {
        await this.reviewsService.createReview(createReviewRequestDTO)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Review Created Successfully!')
    }


    // READ
    // 미구현: logger



    // UPDATE
    // 미구현: logger



    // DELETE
    // 미구현: logger
}
