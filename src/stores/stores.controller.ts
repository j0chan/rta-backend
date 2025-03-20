import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { ReadStoreDTO } from './DTO/read-store.dto'
import { ReadStoreAddressDTO } from './DTO/read-store-address.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadReviewDTO } from 'src/reviews/DTO/read-review.dto'
import { ReviewsService } from 'src/reviews/reviews.service'
import { CreateReviewDTO } from 'src/reviews/DTO/create-review.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'

@Controller('api/stores')
@UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class StoresController {
    constructor(
        private storesService: StoresService,
        private reviewsService: ReviewsService,
    ) { }

    // CREATE
    // 새로운 가게 생성하기
    @Post('/')
    async createStore(@Body() createStoreDTO: CreateStoreDTO): Promise<ApiResponseDTO<void>> {
        await this.storesService.createStore(createStoreDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Store Created Successfully")
    }

    // READ
    // 특정 유저의 모든 가게 조회
    // 매니저가 자신의 가게 조회할 때 사용
    @Get('/user/:user_id')
    @Roles(UserRole.MANAGER)
    async readAllStoresByUser(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readAllStoresByUser(user_id)
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, `Stores with user_id ${user_id} Retrieved Successfully`, readStoreDTOs)
    }

    // READ
    // 모든 가게 조회
    @Get('/')
    async readAllStores(): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readAllStores()
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved Successfully", readStoreDTOs)
    }

    // 특정 가게 상세 정보 조회
    @Get('/:store_id')
    async readStoreById(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadStoreDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Retrieved Successfully", new ReadStoreDTO(store))
    }

    // 특정 가게 주소 조회
    @Get('/:store_id')
    async readStoreAddressById(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadStoreAddressDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Address Retrieved by Id Successfully", new ReadStoreAddressDTO(store))
    }

    // 가게 업종으로 검색(필터링) 조회
    @Get('/')
    async readStoresByCategory(@Query('category') category: StoreCategory): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readStoresByCategory(category)
        const readStoreDTO = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved by Category Successfully", readStoreDTO)
    }

    // UPDATE
    // 가게 매니저 수정 (관리자 전용)
    @Patch('/:store_id')
    @Roles(UserRole.ADMIN)
    async updateStoreManager(@Param('store_id') store_id: number, @Body('user_id') user_id: number): Promise<ApiResponseDTO<void>> {
        await this.storesService.updateStoreManager(store_id, user_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Manager Updated Successfully")
    }

    // 가게 정보 수정 (매니저 전용)
    @Put('/:store_id')
    @Roles(UserRole.MANAGER)
    async updateStoreDetail(@Param('store_id') store_id: number, @Body() updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<ApiResponseDTO<void>> {
        await this.storesService.updateStoreDetail(store_id, updateStoreDetailDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Information Updated Successfully")
    }

    // DELETE
    @Delete('/:store_id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async deleteStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<void>> {
        await this.storesService.deleteStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Deleted Successfully")
    }

    // CREATE
    // 새로운 리뷰 생성
    @Post('/:store_id/reviews')
    @Roles(UserRole.USER)
    async createReview(@Param('store_id') store_id: number, @Body() createReviewDTO: CreateReviewDTO): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.createReview(store_id, createReviewDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Review Created Successfully!')
    }

    // READ
    // 가게 리뷰 조회
    @Get('/:store_id/reviews')
    async readStoreReviews(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const foundReviews = await this.reviewsService.readReviewsByStore(id)
        const readReviewDTOs = foundReviews.map(review => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Reviews Retrieved Successfully", readReviewDTOs)
    }

}
