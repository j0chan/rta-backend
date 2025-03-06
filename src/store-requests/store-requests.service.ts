import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { StoreRequest } from './entities/store-request.entity'
import { Repository } from 'typeorm'
import { CreateStoreRequestDTO } from './DTO/create-store-request.dto'
import { UpdateStoreRequestDTO } from './DTO/update-store-request.dto'
import { RequestStatus } from 'src/common/request-status.enum'
import { StoresService } from 'src/stores/stores.service'
import { CreateStoreDTO } from 'src/stores/DTO/create-store.dto'

@Injectable()
export class StoreRequestsService {

    // init
    constructor(
        @InjectRepository(StoreRequest)
        private storeRequestRepository: Repository<StoreRequest>,
        private storesService: StoresService
    ) {}

    // CREATE
    // 가게 신청서 생성
    async createStoreRequest(createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        const { user_id, store_name, category, address, latitude, longitude, contact_number, description } = createStoreRequestDTO

        // user_id를 이용해 user 객체 가져오기

        // store 객체 생성하기 -> store_id 반환받기
        const createStoreDTO = new CreateStoreDTO(
            store_name,
            category,
            address,
            latitude,
            longitude,
            contact_number,
            description
        )
        const store_id = await this.storesService.createStore(createStoreDTO)

        // store_id를 이용해 store 객체 가져오기
        const store = await this.storesService.readStoreById(store_id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${store_id} not found`)
        }

        // 가게 신청서 생성
        const newStoreRequest: StoreRequest = this.storeRequestRepository.create({
            user_id,
            store,
            status: RequestStatus.SUBMITTED
        })

        await this.storeRequestRepository.save(newStoreRequest)
    }

    // READ
    // 모든 가게 신청서 조회 (관리자 전용)
    async readAllStoreRequest(): Promise<StoreRequest[]> {
        const storeRequests = await this.storeRequestRepository.find()
        if (!storeRequests) {
            throw new NotFoundException('No storeRequests')
        }

        return storeRequests
    }

    // 특정 가게 신청서 조회
    async readStoreRequestById(request_id: number): Promise<StoreRequest> {
        const storeRequest = await this.storeRequestRepository.findOneBy({ request_id: request_id })
        if (!storeRequest) {
            throw new NotFoundException(`Cannot Find request with id ${request_id}`)
        }

        return storeRequest
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    async updateStoreRequest(request_id: number, updateStoreRequestDTO: UpdateStoreRequestDTO): Promise<void> {
        // request_id를 이용해 storeRequest 가져오기
        const foundStoreRequest = await this.readStoreRequestById(request_id)

        const { status, remark } = updateStoreRequestDTO

        foundStoreRequest.status = status
        foundStoreRequest.remark = remark

        await this.storeRequestRepository.save(foundStoreRequest)

        // 신청서 승인 시, 가게 public 처리
        if (status == RequestStatus.APPROVED) {
            await this.storesService.updateStoreToPublic(foundStoreRequest.store.store_id)
        }
        // 신청서 거절 시, 가게 삭제?
    }

    // DELETE
    // 가게 신청서 삭제
    async deleteStoreRequest(request_id: number) {
        // request_id를 이용해 storeRequest 가져오기
        const foundStoreRequest = await this.readStoreRequestById(request_id)

        await this.storeRequestRepository.remove(foundStoreRequest)
    }
}
