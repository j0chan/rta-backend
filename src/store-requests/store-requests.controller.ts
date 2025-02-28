import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreateStoreRequestDTO } from "./DTO/create-store-request.dto";
import { ReadStoreRequestDTO } from "./DTO/read-store-request.dto";
import { StoreRequestsService } from "./store-requests.service";
import { UpdateStoreRequestDTO } from "./DTO/update-store-request.dto";


@Controller('api/store-requests')
export class StoreRequestsController {
    constructor(private storeRequestsService: StoreRequestsService) { }
    // Store Request 가게 신청서

    // CREATE
    // 가게 신청서 생성
    @Post('/')
    async createStoreRequest(@Body() createStoreRequestDTO: CreateStoreRequestDTO): Promise<void> {
        await this.storeRequestsService.createStoreRequest(createStoreRequestDTO)
    }

    // READ
    // 모든 가게 신청서 조회 (관리자 전용)
    @Get('/')
    async getAllStoreRequest(): Promise<ReadStoreRequestDTO[]> {
        const storeRequests = await this.storeRequestsService.getAllStoreRequest()
        if (!storeRequests) { throw new Error('No storeRequests found') }

        const readStoreRequestDTO = storeRequests.map(storeRequest => new ReadStoreRequestDTO(storeRequest))
        return readStoreRequestDTO
    }

    // 특정 가게 신청서 조회
    @Get('/:request_id')
    async getStoreRequestById(@Param('request_id') request_id: number): Promise<ReadStoreRequestDTO> {
        const storeRequest = await this.storeRequestsService.getStoreRequestById(request_id)
        if (!storeRequest) { throw new Error(`StoreRequest with ID ${request_id} not found`) }

        return new ReadStoreRequestDTO(storeRequest)
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    @Put('/:request_id')
    async updateStoreRequest(@Param('request_id') request_id: number, @Body() updateStoreRequestDTO: UpdateStoreRequestDTO) {
        await this.storeRequestsService.updateStoreRequest(request_id, updateStoreRequestDTO)
    }

    // DELETE
    // 가게 신청서 삭제
    @Delete('/:request_id')
    async deleteStoreRequest(@Param('request_id') request_id: number) {
        await this.storeRequestsService.deleteStoreRequest(request_id)
    }

}
