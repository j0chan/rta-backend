import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common'
import { ManagerRequestsService } from './manager-requests.service'
import { CreateManagerRequestDTO } from './DTO/create-manager-request.dto'
import { ReadManagerRequestDTO } from './DTO/read-manager-request.dto'
import { UpdateManagerRequestDTO } from './DTO/update-manager-request.dto'

@Controller('api/manager-requests')
export class ManagerRequestsController {
    constructor(private managerRequestsService: ManagerRequestsService) { }

    // CREATE
    // 점주 신청서 생성
    @Post('/')
    async createManagerRequest(@Body() createManagerRequestDTO: CreateManagerRequestDTO): Promise<void> {
        await this.managerRequestsService.createManagerRequest(createManagerRequestDTO)
    }

    // READ
    // 모든 점주 신청서 조회 (관리자 전용)
    @Get('/')
    async getAllManagerRequests(): Promise<ReadManagerRequestDTO[]> {
        const managerRequests = await this.managerRequestsService.getAllManagerRequests()
        if (!managerRequests) { 
            throw new NotFoundException('No managerRequests')
        }

        const readManagerRequestDTO = managerRequests.map(managerRequest => new ReadManagerRequestDTO(managerRequest))
        return readManagerRequestDTO
    }

    // 특정 점주 신청서 조회
    @Get('/:request_id')
    async getManagerRequestById(@Param('request_id') request_id: number): Promise<ReadManagerRequestDTO> {
        const managerRequest = await this.managerRequestsService.getManagerRequestById(request_id)
        if (!managerRequest) {
            throw new NotFoundException(`Cannot find managerRequest by Id: ${request_id}`)
        }

        return new ReadManagerRequestDTO(managerRequest)
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    @Put('/:request_id')
    async updateManagerRequest(@Param('request_id') request_id: number, updateManagerRequestDTO: UpdateManagerRequestDTO) {
        await this.managerRequestsService.updateManagerRequest(request_id, updateManagerRequestDTO)
    }

    // DELETE
    // 가게 신청서 삭제 
    @Delete('/:request_id') 
    async deleteManagerRequest(@Param('request_id') request_id: number) {
        await this.managerRequestsService.deleteManagerRequest(request_id)
    }
}
