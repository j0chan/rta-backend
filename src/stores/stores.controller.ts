import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'
import { ReadStoreResponseDTO } from './DTO/read-store-response.dto'
import { ReadStoreAddressResponseDTO } from './DTO/read-store-address-response.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailRequestDTO } from './DTO/update-store-detail-requst.dto'

@Controller('api/stores')
export class StoresController {
    constructor(private storesService: StoresService) { }

    // CREATE
    // 새로운 가게 생성하기
    @Post('/')
    async createStore(@Body() createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        await this.storesService.createStore(createStoreRequestDTO)
    }

    // READ
    // 모든 가게 조회
    @Get('/')
    async getAllStores(): Promise<ReadStoreResponseDTO[]> {
        const stores = await this.storesService.getAllStores()
        if (!stores) { throw new Error('No stores found') }
        const storesResponseDTO = stores.map(store => new ReadStoreResponseDTO(store))
        
        return storesResponseDTO
    }

    // 특정 가게 상세 정보 조회
    @Get('/:store_id')
    async getStoreById(@Param('store_id') id: number): Promise<ReadStoreResponseDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }

        return new ReadStoreResponseDTO(store)
    }

    // 특정 가게 주소 조회
    @Get('/:store_id')
    async getStoreAddressById(@Param('store_id') id: number): Promise<ReadStoreAddressResponseDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }
        
        return new ReadStoreAddressResponseDTO(store)
    }
    
    // 가게 업종으로 검색(필터링) 조회 -- 안됨
    @Get('/')
    async getStoresByCategory(@Query('category') category: StoreCategory): Promise<ReadStoreResponseDTO[]> {
        const stores = await this.storesService.getStoresByCategory(category)
        const storeResponseDTO = stores.map(store => new ReadStoreResponseDTO(store))

        return storeResponseDTO
    }

    // UPDATE
    // 가게 매니저 속성 수정 (관리자 전용)
    @Patch('/:store_id')
    async updateStoreManager(@Param('store_id') store_id: number, @Body('user_id') user_id: number): Promise<void> {
        await this.storesService.updateStoreManager(store_id, user_id)
    }

    // 가게 정보 수정 (매니저 전용)
    @Put('/:store_id')
    async updateStoreDetail(@Param('store_id') store_id: number, @Body() updateStoreDetailRequestDTO: UpdateStoreDetailRequestDTO): Promise<void> {
        
        await this.storesService.updateStoreDetail(store_id, updateStoreDetailRequestDTO)
    }
}
