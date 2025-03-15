import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { ReadStoreDTO } from './DTO/read-store.dto'
import { ReadStoreAddressDTO } from './DTO/read-store-address.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadReviewDTO } from 'src/reviews/DTO/read-review.dto'
import { ReviewsService } from 'src/reviews/reviews.service'

@Controller('api/stores')
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

    // 가게 리뷰 조회
    @Get('/:store_id/reviews')
    async readStoreReviews(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const foundReviews = await this.reviewsService.readReviewsByStore(id)
        const readReviewDTOs = foundReviews.map(review => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Reviews Retrieved Successfully", readReviewDTOs)
    }

    // UPDATE
    // 가게 매니저 수정 (관리자 전용)
    @Patch('/:store_id')
    async updateStoreManager(@Param('store_id') store_id: number, @Body('user_id') user_id: number): Promise<ApiResponseDTO<void>> {
        await this.storesService.updateStoreManager(store_id, user_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Manager Updated Successfully")
    }

    // 가게 정보 수정 (매니저 전용)
    @Put('/:store_id')
    async updateStoreDetail(@Param('store_id') store_id: number, @Body() updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<ApiResponseDTO<void>> {
        await this.storesService.updateStoreDetail(store_id, updateStoreDetailDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Information Updated Successfully")
    }

    // DELETE
    @Delete('/:store_id')
    async deleteStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<void>> {
        await this.storesService.deleteStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Deleted Successfully")
    }

}
