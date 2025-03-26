import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Patch, Put, Req, UseGuards } from '@nestjs/common'
import { Review } from './entites/review.entity'
import { UpdateReviewDTO } from './DTO/update-review.dto'
import { ReadReviewDTO } from './DTO/read-review.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'

@Controller('api/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class ReviewsController {

    // 생성자 정의
    constructor(private reviewsService: ReviewsService) { }

    // READ[1] - 모든 리뷰 조회 -> 안쓸듯
    // 미구현: logger
    @Get('/')
    async readAllReviews(): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const reviews: Review[] = await this.reviewsService.readAllReviews()
        const readReviewDTO = reviews.map(review => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Reviews Retrieved Successfully', readReviewDTO)
    }

    // READ[2] - 특정 리뷰 조회 -> 안쓸듯
    // 미구현: looger
    @Get('/:review_id')
    async readReviewById(@Param('review_id') review_id: number): Promise<ApiResponseDTO<Review>> {
        const foundReview: Review = await this.reviewsService.readReviewByReviewId(review_id)
        
        return new ApiResponseDTO(true, HttpStatus.OK, 'Successfully Retrieved Review!', foundReview)
    }

    // UPDATE[1] - 본인 리뷰 수정
    // 미구현: logger
    @Put('/:review_id')
    @Roles(UserRole.USER)
    async updateReviewByReviewId(
        @Req() req: AuthenticatedRequest,
        @Param('review_id') review_id: number,
        @Body() updateReviewDTO: UpdateReviewDTO
    ): Promise<ApiResponseDTO<void>> {
        const foundReview = await this.reviewsService.readReviewByReviewId(review_id)

        // 수정하려는 리뷰가 본인의 리뷰인지 검증
        if(req.user.user_id !== foundReview.user.user_id) {
            throw new ForbiddenException('You Can Only Update Your Own Review.')
        }

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
    @Roles(UserRole.USER)
    async markHelpful(
        @Param("review_id") review_id: number): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.markHelpful(review_id)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Reaction Applied Successfully!')
    }

    // DELETE - 본인 리뷰 삭제
    // 미구현: logger
    @Delete('/:review_id')
    @Roles(UserRole.USER, UserRole.ADMIN)
    async deleteReviewByReviewId(
        @Req() req: AuthenticatedRequest,
        @Param('review_id') review_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundReview = await this.reviewsService.readReviewByReviewId(review_id)

        // USER는 본인 리뷰만 삭제 가능
        if (req.user.user_id !== foundReview.user.user_id) {
            throw new ForbiddenException('You Can Only Delete Your Own Review.')
        }

        await this.reviewsService.deleteReviewById(review_id)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Review Deleted Successfully')
    }
}
