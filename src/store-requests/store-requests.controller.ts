import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, UseGuards } from "@nestjs/common"
import { CreateStoreRequestDTO } from "./DTO/create-store-request.dto"
import { ReadStoreRequestDTO } from "./DTO/read-store-request.dto"
import { StoreRequestsService } from "./store-requests.service"
import { UpdateStoreRequestDTO } from "./DTO/update-store-request.dto"
import { ApiResponseDTO } from "src/common/api-reponse-dto/api-response.dto"
import { RolesGuard } from "src/common/custom-decorators/custom-role.guard"
import { AuthGuard } from "@nestjs/passport"
import { UserRole } from "src/users/entities/user-role.enum"
import { Roles } from "src/common/custom-decorators/roles.decorator"
import { AuthenticatedRequest } from "src/auth/interfaces/authenticated-request.interface"

@Controller('api/store-requests')
@UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class StoreRequestsController {
    constructor(private storeRequestsService: StoreRequestsService) { }
    // Store Request 가게 신청서

    // CREATE - 가게 신청서 생성
    // jwt토큰에서 user_id추출해서 전달하는 구조
    @Post('/')
    @Roles(UserRole.MANAGER)
    async createStoreRequest(
        @Req() req: AuthenticatedRequest,
        @Body() createStoreRequestDTO: CreateStoreRequestDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        await this.storeRequestsService.createStoreRequest(user_id, createStoreRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Request Created Successfully')
    }

    // READ
    // 모든 가게 신청서 조회 (관리자 전용)
    @Get('/')
    @Roles(UserRole.ADMIN)
    async readAllStoreRequest(): Promise<ApiResponseDTO<ReadStoreRequestDTO[]>> {
        const storeRequests = await this.storeRequestsService.readAllStoreRequest()
        if (!storeRequests) {
            throw new NotFoundException(`Cannot Find Requests`)
        }

        const readStoreRequestDTOs = storeRequests.map(storeRequest => new ReadStoreRequestDTO(storeRequest))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Requests Retrieved Successfully', readStoreRequestDTOs)
    }

    // 특정 가게 신청서 조회
    // 비고: 내 가게 신청서 조회하는 기능 구현 할 것인지?
    //       만약 한다면 본인 신청서만 조회하는 기능 추가 필요.
    @Get('/:request_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async readStoreRequestById(@Param('request_id') request_id: number): Promise<ApiResponseDTO<ReadStoreRequestDTO>> {
        const storeRequest = await this.storeRequestsService.readStoreRequestById(request_id)
        if (!storeRequest) {
            throw new NotFoundException(`Cannot Find Request by Id ${request_id}`)
        }

        const readStoreRequestDTO = new ReadStoreRequestDTO(storeRequest)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Request Retrieved Successfully', readStoreRequestDTO)
    }

    // UPDATE
    // 가게 신청서 처리 (관리자 전용)
    @Put('/:request_id')
    @Roles(UserRole.ADMIN)
    async updateStoreRequest(@Param('request_id') request_id: number, @Body() updateStoreRequestDTO: UpdateStoreRequestDTO): Promise<ApiResponseDTO<void>> {
        await this.storeRequestsService.updateStoreRequest(request_id, updateStoreRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Request Updated Successfully')
    }

    // DELETE
    // 가게 신청서 삭제
    @Delete('/:request_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async deleteStoreRequest(
        @Req() req: AuthenticatedRequest,
        @Param('request_id') request_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundRequest = await this.storeRequestsService.readStoreRequestById(request_id)

        if (foundRequest.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Only Delete Your Own Store Request.')
        }

        await this.storeRequestsService.deleteStoreRequest(request_id)
        return new ApiResponseDTO(true, HttpStatus.OK, 'Request Deleted Successfully')
    }

}
