import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReviewsService } from './reviews.service'
import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Logger, Param, ParseIntPipe, Patch, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { Review } from './entities/review.entity'
import { UpdateReviewDTO } from './DTO/update-review.dto'
import { ReadReviewDTO } from './DTO/read-review.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { CreateReviewDTO } from './DTO/create-review.dto'
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('api/stores/:store_id/reviews')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewsController {
    private readonly logger = new Logger(ReviewsController.name)

    constructor(private reviewsService: ReviewsService) { }

    // CREATE - 새로운 리뷰 생성
    @Post('/')
    @Roles(UserRole.USER)
    @UseInterceptors(FilesInterceptor('files'))
    async createReview(
        @Param('store_id') store_id: number,
        @Req() req: AuthenticatedRequest,
        @Body() createReviewDTO: CreateReviewDTO,
        @UploadedFiles() files: Express.Multer.File[]
    ): Promise<ApiResponseDTO<{ review_id: number }>> {
        this.logger.log(`createReview START`)

        const user_id = req.user.user_id

        const newReview = await this.reviewsService.createReview(store_id, user_id, createReviewDTO, files)

        this.logger.log(`createReview END`)
        return new ApiResponseDTO(
            true,
            HttpStatus.CREATED,
            'Review Created Successfully!',
            { review_id: newReview.review_id }
        )
    }

    // READ[1] 가게 리뷰 조회
    @Get('/')
    async readStoreReviews(
        @Param('store_id') id: number
    ): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        this.logger.log(`readStoreReviews START`)

        const foundReviews = await this.reviewsService.readReviewsByStore(id)
        const readReviewDTOs = foundReviews.map(review => new ReadReviewDTO(review))

        this.logger.log(`readStoreReviews END`)
        return new ApiResponseDTO(true, HttpStatus.OK, "Store Reviews Retrieved Successfully", readReviewDTOs)
    }

    // READ[2] - 특정 리뷰 조회 -> 안쓸듯
    @Get('/:review_id')
    async readReviewById(
        @Param('review_id') review_id: number
    ): Promise<ApiResponseDTO<Review>> {
        this.logger.log(`readReviewById START`)

        const foundReview: Review = await this.reviewsService.readReviewByReviewId(review_id)

        this.logger.log(`readReviewById END`)
        return new ApiResponseDTO(true, HttpStatus.OK, 'Successfully Retrieved Review!', foundReview)
    }

    // READ - 나의 리뷰 조회 [별도의 컨트롤러 생성]
    // @Get('/my-reviews')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(UserRole.USER)
    // async readMyReviews(
    //     @Req() req: AuthenticatedRequest
    // ): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
    //     this.logger.log(`readMyReviews START`)

    //     const user_id = req.user.user_id

    //     const foundReviews = await this.reviewsService.readReviewsByUser(user_id)
    //     const readReviewDTOs = foundReviews.map((review) => new ReadReviewDTO(review))

    //     this.logger.log(`readMyReviews END`)
    //     return new ApiResponseDTO(true, HttpStatus.OK, 'My Reviews Retrieved Successfully', readReviewDTOs)
    // }

    // UPDATE[1] - 본인 리뷰 수정
    @Put('/:review_id')
    @Roles(UserRole.USER)
    async updateReviewByReviewId(
        @Req() req: AuthenticatedRequest,
        @Param('review_id') review_id: number,
        @Body() updateReviewDTO: UpdateReviewDTO
    ): Promise<ApiResponseDTO<void>> {
        this.logger.log(`updateReviewByReviewId START`)

        const foundReview = await this.reviewsService.readReviewByReviewId(review_id)

        // 수정하려는 리뷰가 본인의 리뷰인지 검증
        if (req.user.user_id !== foundReview.user.user_id) {
            throw new ForbiddenException('You Can Only Update Your Own Review.')
        }

        await this.reviewsService.updateReviewByReviewId(review_id, updateReviewDTO)

        this.logger.log(`updateReviewByReviewId END`)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Review Updated Successfully!')
    }

    // UPDATE[2] - 리뷰 도움됐어요 반응
    @Patch('/:review_id/helpful')
    @Roles(UserRole.USER)
    async markHelpful(
        @Param("review_id") review_id: number
    ): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.markHelpful(review_id)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Reaction Applied Successfully!')
    }

    // DELETE - 본인 리뷰 삭제
    @Delete('/:review_id')
    @Roles(UserRole.USER, UserRole.ADMIN)
    async deleteReviewByReviewId(
        @Req() req: AuthenticatedRequest,
        @Param('review_id') review_id: number
    ): Promise<ApiResponseDTO<void>> {
        this.logger.log(`deleteReviewByReviewId START`)

        const foundReview = await this.reviewsService.readReviewByReviewId(review_id)
        if (req.user.user_id !== foundReview.user.user_id) {
            throw new ForbiddenException('You Can Only Delete Your Own Review.')
        }

        await this.reviewsService.deleteReviewById(review_id)

        this.logger.log(`deleteReviewByReviewId END`)
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Review Deleted Successfully')
    }

    @Post(':reviewId/helpful')
    async toggleHelpful(
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Req() req
    ) {
        const userId = req.user.user_id
        return await this.reviewsService.toggleHelpful(reviewId, userId)
    }

}
