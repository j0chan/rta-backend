import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { ReadStoreDTO } from './DTO/read-store.dto'
import { ReadStoreAddressDTO } from './DTO/read-store-address.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'
import { ReadStoreRequestDTO } from './DTO/read-store-request.dto'
import { UpdateStoreRequestDTO } from './DTO/update-store-request.dto'

@Controller('api/stores')
export class StoresController {
    constructor(private storesService: StoresService) { }


    // --------------------
    // Store Request 가게 신청서

    // CREATE
    // 가게 신청서 생성
    @Post('/request/')
    async createStoreRequest(@Body() createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        await this.storesService.createStoreRequest(createStoreRequestDTO)
    }

    // READ
    // 모든 가게 신청서 조회 (관리자 전용)
    @Get('/request/')
    async getAllStoreRequest(): Promise<ReadStoreRequestDTO[]> {
        const storeRequests = await this.storesService.getAllStoreRequest()
        if (!storeRequests) { throw new Error('No storeRequests found') }

        const readStoreRequestDTO = storeRequests.map(storeRequest => new ReadStoreRequestDTO(storeRequest))
        return readStoreRequestDTO
    }

    // 특정 가게 신청서 조회
    @Get('/request/:request_id')
    async getStoreRequestById(@Param('request_id') request_id: number): Promise<ReadStoreRequestDTO> {
        const storeRequest = await this.storesService.getStoreRequestById(request_id)
        if (!storeRequest) { throw new Error(`StoreRequest with ID ${request_id} not found`)}
        
        return new ReadStoreRequestDTO(storeRequest)
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    @Put('/request/:request_id')
    async updateStoreRequest(@Param('request_id') request_id: number, @Body() updateStoreRequestDTO: UpdateStoreRequestDTO) {
        await this.storesService.updateStoreRequest(request_id, updateStoreRequestDTO)
    }

    // DELETE
    // 가게 신청서 삭제
    @Delete('/request/:request_id')
    async deleteStoreRequest(@Param('request_id') request_id: number) {
        await this.storesService.deleteStoreRequest(request_id)
    }

    // --------------------
    // CREATE
    // 새로운 가게 생성하기
    @Post('/')
    async createStore(@Body() createStoreDTO: CreateStoreDTO): Promise<void> {
        await this.storesService.createStore(createStoreDTO)
    }

    // READ
    // 모든 가게 조회
    @Get('/')
    async getAllStores(): Promise<ReadStoreDTO[]> {
        const stores = await this.storesService.getAllStores()
        if (!stores) { throw new Error('No stores found') }
        const readStoreDTO = stores.map(store => new ReadStoreDTO(store))
        
        return readStoreDTO
    }

    // 특정 가게 상세 정보 조회
    @Get('/:store_id')
    async getStoreById(@Param('store_id') id: number): Promise<ReadStoreDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }

        return new ReadStoreDTO(store)
    }

    // 특정 가게 주소 조회
    @Get('/:store_id')
    async getStoreAddressById(@Param('store_id') id: number): Promise<ReadStoreAddressDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }
        
        return new ReadStoreAddressDTO(store)
    }
    
    // 가게 업종으로 검색(필터링) 조회
    @Get('/')
    async getStoresByCategory(@Query('category') category: StoreCategory): Promise<ReadStoreDTO[]> {
        const stores = await this.storesService.getStoresByCategory(category)
        const readStoreDTO = stores.map(store => new ReadStoreDTO(store))

        return readStoreDTO
    }

    // UPDATE
    // 가게 매니저 수정 (관리자 전용)
    @Patch('/:store_id')
    async updateStoreManager(@Param('store_id') store_id: number, @Body('user_id') user_id: number): Promise<void> {
        await this.storesService.updateStoreManager(store_id, user_id)
    }

    // 가게 정보 수정 (매니저 전용)
    @Put('/:store_id')
    async updateStoreDetail(@Param('store_id') store_id: number, @Body() updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<void> {
        
        await this.storesService.updateStoreDetail(store_id, updateStoreDetailDTO)
    }

    // DELETE

    
}
