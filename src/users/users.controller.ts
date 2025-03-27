import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { UsersService } from './users.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Put, Query, Req, UseGuards } from '@nestjs/common'
import { User } from './entities/user.entity'
import { ReadUserDTO } from './DTO/read-user.dto'
import { UpdateUserDTO } from './DTO/update-user.dto'
import { ReadManagerRequestDTO } from 'src/manager-requests/DTO/read-manager-request.dto'
import { ManagerRequestsService } from 'src/manager-requests/manager-requests.service'
import { StoreRequestsService } from 'src/store-requests/store-requests.service'
import { ReadStoreRequestDTO } from 'src/store-requests/DTO/read-store-request.dto'
import { ReadReviewDTO } from 'src/reviews/DTO/read-review.dto'
import { ReviewsService } from 'src/reviews/reviews.service'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { UserRole } from './entities/user-role.enum'
import { AuthGuard } from '@nestjs/passport'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'

@Controller('api/users')
export class UsersController {
    // init
    constructor(
        private usersService: UsersService,
        private managerRequestsService: ManagerRequestsService,
        private storeRequestsService: StoreRequestsService,
        private reviewsService: ReviewsService,
    ) { }

    // READ - 모든 유저 정보 조회
    // 미구현: logger
    @Get('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async readAllUsers(): Promise<ApiResponseDTO<ReadUserDTO[]>> {
        const users: User[] = await this.usersService.readAllUsers()
        const readUserDTOs: ReadUserDTO[] = users.map(user => new ReadUserDTO(user))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Users Retrieved Successfully', readUserDTOs)
    }

    // READ - 이메일 중복 검사
    // readUserById 메서드보다 위에 있어야 함.
    @Get('/check-email')
    async readEmailExists(@Query('email') email: string): Promise<ApiResponseDTO<boolean>> {
        const exists = await this.usersService.readEmailExists(email)
        return new ApiResponseDTO(true, HttpStatus.OK, 'Email Check Completed', exists)
    }

    // READ - 내 정보 조회
    // 미구현: logger
    @Get('/my')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async readUserById(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadUserDTO>> {
        const user_id = req.user.user_id

        const foundUser: User = await this.usersService.readUserById(user_id)

        const readUserDTO: ReadUserDTO = new ReadUserDTO(foundUser)

        return new ApiResponseDTO(true, HttpStatus.OK, 'User Retrieved Successfully', readUserDTO)
    }

    // READ - 나의 점주 신청서 조회
    @Get('/my-manager-requests')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.MANAGER)
    async readMyManagerRequests(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
        const user_id = req.user.user_id

        const foundRequests = await this.managerRequestsService.readManagerRequestByUser(user_id)
        const readManagerRequestDTO = foundRequests.map((request) => new ReadManagerRequestDTO(request))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My ManagerRequests Retrieved Successfully', readManagerRequestDTO)
    }

    // READ - 나의 가게 신청서 조회
    @Get('/my-store-requests')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER)
    async readMyStoreRequests(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadStoreRequestDTO[]>> {
        const user_id = req.user.user_id

        const foundRequests = await this.storeRequestsService.readStoreRequestByUser(user_id)
        const readStoreRequestDTOs = foundRequests.map((request) => new ReadStoreRequestDTO(request))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My StoreRequests Retrieved Successfully', readStoreRequestDTOs)
    }

    // READ - 나의 리뷰 조회
    @Get('/my-reviews')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER)
    async readMyReviews(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const user_id = req.user.user_id

        const foundReviews = await this.reviewsService.readReviewsByUser(user_id)
        const readReviewDTOs = foundReviews.map((review) => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My Reviews Retrieved Successfully', readReviewDTOs)
    }

    // UPDATE - by user_id
    // 미구현: logger
    @Put('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER, UserRole.MANAGER)
    async updateUserById(
        @Req() req: AuthenticatedRequest,
        @Body() updateUserDto: UpdateUserDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id

        await this.usersService.updateUserById(user_id, updateUserDto)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Updated Successfully')
    }

    // DELETE - 탈퇴
    // 미구현: logger
    @Delete('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER, UserRole.MANAGER)
    async deleteUserById(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        
        await this.usersService.deleteUserById(user_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Deleted Successfully')
    }
}
