import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from './entities/store.entity'
import { Repository } from 'typeorm'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailRequestDTO } from './DTO/update-store-detail-requst.dto'

@Injectable()
export class StoresService {

    // init
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>
    ) {}

    // CREATE
    // 새로운 가게 생성하기
    async createStore(createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        const { store_name, category, address, latitude, longtitude, contact_number, description } = createStoreRequestDTO
        const temp_user_id = 1

        const newStore: Store = this.storesRepository.create({
            user_id: temp_user_id,
            store_name,
            category,
            address,
            latitude,
            longtitude,
            contact_number,
            description
        })

        await this.storesRepository.save(newStore)
    }

    // READ
    // 모든 가게 조회
    async getAllStores(): Promise<Store[]> {
        const stores = await this.storesRepository.find()

        return stores
    }

    // 특정 가게 조회
    async getStoreById(store_id: number): Promise<Store | null> {
        const store = await this.storesRepository.findOneBy({ store_id: store_id })

        return store
    }

    // 가게 업종(category)으로 검색 조회
    async getStoresByCategory(category: StoreCategory): Promise<Store[]> {
        const stores = await this.storesRepository.findBy({ category: category })

        return stores
    }

    // UPDATE
    // 가게 매니저 속성 수정 (관리자 전용)
    async updateStoreManager(store_id: number, user_id: number): Promise<void> { 
        const store = await this.getStoreById(store_id)
        if (!store) { return }

        store.user_id = user_id
    }

    // 가게 정보 수정 (매니저 전용)
    async updateStoreDetail(store_id: number, updateStoreDetailRequestDTO: UpdateStoreDetailRequestDTO): Promise<void> {
        const store = await this.getStoreById(store_id)
        if (!store) { return }

        const { store_name, owner_name, category, contact_number, description } = updateStoreDetailRequestDTO
        
        store.store_name = store_name
        store.owner_name = owner_name
        store.category = category
        store.contact_number = contact_number
        store.description = description
    }

    // DELETE

}
