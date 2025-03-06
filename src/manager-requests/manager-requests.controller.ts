import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common'
import { ManagerRequestsService } from './manager-requests.service'
import { CreateManagerRequestDTO } from './DTO/create-manager-request.dto'
import { ReadManagerRequestDTO } from './DTO/read-manager-request.dto'
import { UpdateManagerRequestDTO } from './DTO/update-manager-request.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'

@Controller('api/manager-requests')
export class ManagerRequestsController {
    constructor(private managerRequestsService: ManagerRequestsService) { }

    // CREATE
    // 점주 신청서 생성
    @Post('/')
    async createManagerRequest(@Body() createManagerRequestDTO: CreateManagerRequestDTO): Promise<ApiResponseDTO<void>> {
        await this.managerRequestsService.createManagerRequest(createManagerRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Request Created Successfully")
    }

    // READ
    // 모든 점주 신청서 조회 (관리자 전용)
    @Get('/')
    async readAllManagerRequests(): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
        const managerRequests = await this.managerRequestsService.readAllManagerRequests()
        if (!managerRequests) { 
            throw new NotFoundException('No managerRequests')
        }

        const readManagerRequestDTO = managerRequests.map(managerRequest => new ReadManagerRequestDTO(managerRequest))

        return new ApiResponseDTO(true, HttpStatus.OK, "Requests Retrieved Successfully", readManagerRequestDTO)
    }

    // 특정 점주 신청서 조회
    @Get('/:request_id')
    async readManagerRequestById(@Param('request_id') request_id: number): Promise<ApiResponseDTO<ReadManagerRequestDTO>> {
        const managerRequest = await this.managerRequestsService.readManagerRequestById(request_id)
        if (!managerRequest) {
            throw new NotFoundException(`Cannot Find Request by Id ${request_id}`)
        }

        const readManagerRequestDTO = new ReadManagerRequestDTO(managerRequest)
        return new ApiResponseDTO(true, HttpStatus.OK, "Request Retrieved Successfully", readManagerRequestDTO)
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    @Put('/:request_id')
    async updateManagerRequest(@Param('request_id') request_id: number, updateManagerRequestDTO: UpdateManagerRequestDTO): Promise<ApiResponseDTO<void>> {
        await this.managerRequestsService.updateManagerRequest(request_id, updateManagerRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, "Request Updated Successfully")
    }

    // DELETE
    // 가게 신청서 삭제 
    @Delete('/:request_id') 
    async deleteManagerRequest(@Param('request_id') request_id: number): Promise<ApiResponseDTO<void>> {
        await this.managerRequestsService.deleteManagerRequest(request_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Request Deleted Successfully")
    }
}
