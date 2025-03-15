import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { UsersService } from './users.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { User } from './entities/user.entity'
import { ReadUserDTO } from './DTO/read-user.dto'
import { UpdateUserDTO } from './DTO/update-user.dto'
import { ReadAllUsersDTO } from './DTO/read-all-users.dto'
import { ReadManagerRequestDTO } from 'src/manager-requests/DTO/read-manager-request.dto'
import { ManagerRequestsService } from 'src/manager-requests/manager-requests.service'
import { StoreRequestsService } from 'src/store-requests/store-requests.service'
import { ReadStoreRequestDTO } from 'src/store-requests/DTO/read-store-request.dto'
import { ReadReviewDTO } from 'src/reviews/DTO/read-review.dto'
import { ReviewsService } from 'src/reviews/reviews.service'

@Controller('api/users')
export class UsersController {
    // init
    constructor(
        private usersService: UsersService,
        private managerRequestsService: ManagerRequestsService,
        private storeRequestsService: StoreRequestsService,
        private reviewsService: ReviewsService,
    ) { }

    // READ[1] - 모든 유저 정보 조회
    // 미구현: logger
    @Get('/')
    async readAllUsers(): Promise<ApiResponseDTO<ReadAllUsersDTO[]>> {
        const users: User[] = await this.usersService.readAllUsers()
        const readAllUsersDTO: ReadAllUsersDTO[] = users.map(user => new ReadAllUsersDTO(user))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Users Retrieved Successfully', readAllUsersDTO)
    }

    // READ[2] - 내 정보 조회
    // 미구현: logger
    @Get('/:user_id')
    async readUserById(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadUserDTO>> {
        const foundUser: User = await this.usersService.readUserById(user_id)

        const readUserDTO: ReadUserDTO = new ReadUserDTO(foundUser)

        return new ApiResponseDTO(true, HttpStatus.OK, 'User Retrieved Successfully', readUserDTO)
    }

    // 나의 점주 신청서 조회
    @Get('/:user_id/manager-requests')
    async readMyManagerRequests(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
        const foundRequests = await this.managerRequestsService.readManagerRequestByUser(user_id)
        const readManagerRequestDTO = foundRequests.map((request) => new ReadManagerRequestDTO(request))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My ManagerRequests Retrieved Successfully', readManagerRequestDTO)
    }

    // 나의 가게 신청서 조회
    @Get('/:user_id/store-requests')
    async readMyStoreRequests(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadStoreRequestDTO[]>> {
        const foundRequests = await this.storeRequestsService.readStoreRequestByUser(user_id)
        const readStoreRequestDTO = foundRequests.map((request) => new ReadStoreRequestDTO(request))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My StoreRequests Retrieved Successfully', readStoreRequestDTO)
    }

    // 나의 리뷰 조회
    @Get('/:user_id/reviews')
    async readMyReviews(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const foundReviews = await this.reviewsService.readReviewsByUser(user_id)
        const readReviewDTOs = foundReviews.map((review) => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, 'My Reviews Retrieved Successfully', readReviewDTOs)
    }

    // UPDATE - by user_id
    // 미구현: logger
    @Put('/:user_id')
    async updateUserById(
        @Param('user_id') user_id: number,
        @Body() updateUserDto: UpdateUserDTO): Promise<ApiResponseDTO<void>> {
        await this.usersService.updateUserById(user_id, updateUserDto)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Updated Successfully')
    }

    // DELETE - 탈퇴
    // 미구현: logger
    @Delete('/:user_id')
    async deleteUserById(@Param('user_id') user_id: number): Promise<ApiResponseDTO<void>> {
        await this.usersService.deleteUserById(user_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Deleted Successfully')
    }
}
