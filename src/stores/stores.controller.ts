import { Body, Controller, NotFoundException, Param, Query } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'
import { StoreResponseDTO } from './DTO/store-response.dto'
import { StoreAddressResponseDTO } from './DTO/store-address-response.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailRequestDTO } from './DTO/update-store-detail-requst.dto'

@Controller('stores')
export class StoresController {
    constructor(private storesService: StoresService) { }

    // CREATE
    // 새로운 가게 생성하기
    async createStore(@Body() createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        await this.storesService.createStore(createStoreRequestDTO)
    }

    // READ
    // 모든 가게 조회
    async getAllStores(): Promise<StoreResponseDTO[]> {
        const stores = await this.storesService.getAllStores()
        const storesResponseDTO = stores.map(store => new storesResponseDTO(store))
        
        return storesResponseDTO
    }

    // 특정 가게 상세 정보 조회
    async getStoreById(@Param('store_id') id: number): Promise<StoreResponseDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }

        return new StoreResponseDTO(store)
    }

    // 특정 가게 주소 조회
    async getStoreAddressById(@Param('store_id') id: number): Promise<StoreAddressResponseDTO> {
        const store = await this.storesService.getStoreById(id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${id} not found`)
        }
        
        return new StoreAddressResponseDTO(store)
    }
    
    // 가게 업종으로 검색 조회
    // !!!! Query vs Param -> Param은 필수로 입력받는 요소이고 Query는 선택적으로 사용하는 요소라고 함. 따라서 Query가 더 적합하다는 결론
    async getStoresByCategory(@Query('category') category: StoreCategory): Promise<StoreResponseDTO[]> {
        const stores = await this.storesService.getStoresByCategory(category)
        const storeResponseDTO = stores.map(store => new StoreResponseDTO(store))

        return storeResponseDTO
    }

    // UPDATE
    // 가게 매니저 속성 수정 (관리자 전용)
    async updateStoreManager(@Param('store_id') store_id: number, user_id: number): Promise<void> {
        await this.storesService.updateStoreManager(store_id, user_id)
    }

    // 가게 정보 수정 (매니저 전용)
    async updateStoreDetail(@Param('store_id') store_id: number, updateStoreDetailRequestDTO: UpdateStoreDetailRequestDTO): Promise<void> {
        await this.storesService.updateStoreDetail(store_id, updateStoreDetailRequestDTO)
    }


}
