import { AuthGuard } from '@nestjs/passport'
import { ReviewsService } from './reviews.service'
import { Controller, Get, HttpStatus, Logger, Req, UseGuards } from "@nestjs/common"
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { UserRole } from 'src/users/entities/user-role.enum'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadReviewDTO } from './DTO/read-review.dto'

@Controller('api/reviews')
export class MyReviewsController {
    private readonly logger = new Logger(MyReviewsController.name)

    constructor(private reviewsService: ReviewsService) { }

    @Get('/my-reviews')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER)
    async readMyReviews(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        this.logger.log(`readMyReviews START`)

        const user_id = req.user.user_id

        const foundReviews = await this.reviewsService.readReviewsByUser(user_id)
        const readReviewDTOs = foundReviews.map((review) => new ReadReviewDTO(review))

        this.logger.log(`readMyReviews END`)
        return new ApiResponseDTO(true, HttpStatus.OK, 'My Reviews Retrieved Successfully', readReviewDTOs)
    }
}