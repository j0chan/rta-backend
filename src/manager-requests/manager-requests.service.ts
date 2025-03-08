import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ManagerRequest } from './entities/manager-requests.entity'
import { CreateManagerRequestDTO } from './DTO/create-manager-request.dto'
import { StoresService } from 'src/stores/stores.service'
import { UpdateManagerRequestDTO } from './DTO/update-manager-request.dto'
import { RequestStatus } from 'src/common/request-status.enum'

@Injectable()
export class ManagerRequestsService {

    // init
    constructor(
        @InjectRepository(ManagerRequest)
        private managerRequestRepository: Repository<ManagerRequest>,
        private storesService: StoresService
    ) { }

    // CREATE
    // 점주 신청서 생성 (store가 존재하는 경우)
    async createManagerRequest(createManagerRequestDTO: CreateManagerRequestDTO): Promise<void> {
        const { user_id, store_id } = createManagerRequestDTO

        // user_id를 이용해 user 가져오기

        // store_id를 이용해 store 가져오기
        const store = await this.storesService.readStoreById(store_id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${store_id} not found`)
        }

        // manager request 생성
        const newManagerRequest = this.managerRequestRepository.create({
            user_id,
            store,
            status: RequestStatus.SUBMITTED
        })

        await this.managerRequestRepository.save(newManagerRequest)
    }

    // 점주 신청서 작성 (store가 존재하지 않는 경우)

    // READ
    // 모든 점주 신청서 조회 (관리자 전용)
    async readAllManagerRequests(): Promise<ManagerRequest[]> {
        const managerRequests = await this.managerRequestRepository.find()
        if (!managerRequests) {
            throw new NotFoundException('No ManagerRequests')
        }

        return managerRequests
    }

    // 특정 점주 신청서 조회 
    async readManagerRequestById(request_id: number): Promise<ManagerRequest> {
        const managerRequest = await this.managerRequestRepository.findOne({
            where: { request_id },
            relations: ["store"]
        })
        if (!managerRequest) {
            throw new NotFoundException(`Cannot Find request_id ${request_id}`)
        }

        return managerRequest
    }


    // UPDATE
    // 점주 신청서 처리 (관리자 전용)
    async updateManagerRequest(request_id: number, updateManagerRequestDTO: UpdateManagerRequestDTO): Promise<void> {
        const foundManagerRequest = await this.readManagerRequestById(request_id)

        const { status, remark } = updateManagerRequestDTO

        foundManagerRequest.status = status
        foundManagerRequest.remark = remark

        await this.managerRequestRepository.save(foundManagerRequest)

        // 신청서 승인 시, 가게 점주 변경
        if (status == RequestStatus.APPROVED) {
            const store_id = foundManagerRequest.store.store_id
            const manager_id = foundManagerRequest.user_id

            await this.storesService.updateStoreManager(store_id, manager_id)
        }
    }

    // DELETE
    // 점주 신청서 삭제
    async deleteManagerRequest(request_id: number): Promise<void> {
        const foundManagerRequest = await this.readManagerRequestById(request_id)

        await this.managerRequestRepository.remove(foundManagerRequest)
    }
}
