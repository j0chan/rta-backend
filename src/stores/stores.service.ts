import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from './entities/store.entity'
import { Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { StoreRequest } from './entities/store-request.entity'
import { RequestStatus } from './entities/request-status.enum'
import { UpdateStoreRequestDTO } from './DTO/update-store-request.dto'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'

@Injectable()
export class StoresService {

    // init
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        @InjectRepository(StoreRequest)
        private storeRequestRepository: Repository<StoreRequest>
    ) {}

    // --------------------
    // Store Request 가게 신청서

    // CREATE
    // 가게 신청서 생성
    async createStoreRequest(createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        const { user_id, store_id } = createStoreRequestDTO
        
        // user_id를 이용해 user 객체 가져오기

        // store_id를 이용해 store 객체 가져오기
        const store = await this.getStoreById(store_id)
        if (!store) { 
            throw new NotFoundException(`Store with ID ${store_id} not found`)
        }

        const newStoreRequest: StoreRequest = this.storeRequestRepository.create({
            user_id,
            store,
            status: RequestStatus.SUBMITTED
        }) 

        await this.storeRequestRepository.save(newStoreRequest)
    }

    // READ
    // 모든 가게 신청서 조회 (관리자 전용)
    async getAllStoreRequest(): Promise<StoreRequest[]> {
        const storeRequests = await this.storeRequestRepository.find()
        if (!storeRequests) {
            throw new NotFoundException('No storeRequests')
        }

        return storeRequests
    }

    // 특정 가게 신청서 조회
    async getStoreRequestById(request_id: number): Promise<StoreRequest> {
        const storeRequest = await this.storeRequestRepository.findOneBy({ request_id: request_id })
        if (!storeRequest) {
            throw new NotFoundException(`Cannot Find request_id: ${request_id}`)
        }

        return storeRequest
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    async updateStoreRequest(request_id: number, updateStoreRequestDTO: UpdateStoreRequestDTO): Promise<void> {
        // request_id를 이용해 storeRequest 가져오기
        const foundStoreRequest = await this.getStoreRequestById(request_id)
        if (!foundStoreRequest) { return }

        const { status, remark } = updateStoreRequestDTO

        foundStoreRequest.status = status
        foundStoreRequest.remark = remark
        
        await this.storeRequestRepository.save(foundStoreRequest)

        // 신청서 승인 시, 가게 public 처리
        if (status == RequestStatus.APPROVED) {
            await this.updateStoreToPublic(foundStoreRequest.store.store_id)
        }
        // 신청서 거절 시, 가게 삭제?
    }

    // DELETE
    // 가게 신청서 삭제
    async deleteStoreRequest(request_id: number) {
        // request_id를 이용해 storeRequest 가져오기
        const foundStoreRequest = await this.storeRequestRepository.findOneBy({ request_id: request_id })
        if (!foundStoreRequest) {
            throw new NotFoundException(`Cannot Find request_id: ${request_id}`)
        }

        await this.storeRequestRepository.remove(foundStoreRequest)
    }


    // --------------------
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
