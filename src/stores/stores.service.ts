import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from './entities/store.entity'
import { Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { StoreRequest } from '../store-requests/entities/store-request.entity'
import { RequestStatus } from '../common/request-status.enum'
import { UpdateStoreRequestDTO } from '../store-requests/DTO/update-store-request.dto'
import { CreateStoreRequestDTO } from '../store-requests/DTO/create-store-request.dto'

@Injectable()
export class StoresService {

    // init
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>
    ) {}

    // CREATE
    // 새로운 가게 생성하기
    async createStore(createStoreDTO: CreateStoreDTO): Promise<void> {
        const { store_name, category, address, latitude, longitude, contact_number, description } = createStoreDTO
        const temp_user_id = 1

        const newStore: Store = this.storesRepository.create({
            user_id: temp_user_id,
            store_name,
            category,
            address,
            latitude,
            longitude,
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
        const foundStore = await this.getStoreById(store_id)
        if (!foundStore) { return }

        await this.storesRepository.update(store_id, {user_id})
    }

    // 가게 정보 수정 (매니저 전용)
    async updateStoreDetail(store_id: number, updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<void> {
        const foundStore = await this.getStoreById(store_id)
        if (!foundStore) { return }

        const { store_name, owner_name, category, contact_number, description } = updateStoreDetailDTO
        
        foundStore.store_name = store_name
        foundStore.owner_name = owner_name
        foundStore.category = category
        foundStore.contact_number = contact_number
        foundStore.description = description

        await this.storesRepository.save(foundStore)
    }

    // 가게 비공개 -> 공개 전환
    async updateStoreToPublic(store_id: number) {
        const foundStore = await this.getStoreById(store_id)
        if (!foundStore) { return }

        await this.storesRepository.update(store_id, { public: true })
    }

    // DELETE
}
