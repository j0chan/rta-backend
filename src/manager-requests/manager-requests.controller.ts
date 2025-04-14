import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ManagerRequestsService } from './manager-requests.service'
import { CreateManagerRequestDTO } from './DTO/create-manager-request.dto'
import { ReadManagerRequestDTO } from './DTO/read-manager-request.dto'
import { UpdateManagerRequestDTO } from './DTO/update-manager-request.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'

@Controller('api/manager-requests')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ManagerRequestsController {
    constructor(private managerRequestsService: ManagerRequestsService) { }

    // CREATE
    @Post('/')
    @Roles(UserRole.USER, UserRole.MANAGER)
    async createManagerRequest(
        @Req() req: AuthenticatedRequest,
        @Body() createManagerRequestDTO: CreateManagerRequestDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        await this.managerRequestsService.createManagerRequest(user_id, createManagerRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Request Created Successfully")
    }

    // 로그인된 회원의(나의) 점주신청서 조회
    @Get('/my')
    @Roles(UserRole.USER, UserRole.MANAGER)
    async readMyManagerRequest(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
        const logginedUser = req.user.user_id
        const managerRequest = await this.managerRequestsService.readManagerRequestByUser(logginedUser)
        if (!managerRequest) {
            throw new NotFoundException(`Cannot Find Request by Id ${logginedUser}`)
        }

        const readManagerRequestDTOs = managerRequest.map(request => new ReadManagerRequestDTO(request))
        return new ApiResponseDTO(true, HttpStatus.OK, "Request Retrieved Successfully", readManagerRequestDTOs)
    }
    
    // READ
    @Get('/')
    @Roles(UserRole.ADMIN)
    async readAllManagerRequests(): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
        const managerRequests = await this.managerRequestsService.readAllManagerRequests()
        if (!managerRequests) {
            throw new NotFoundException('No managerRequests')
        }

        const readManagerRequestDTO = managerRequests.map(managerRequest => new ReadManagerRequestDTO(managerRequest))

        return new ApiResponseDTO(true, HttpStatus.OK, "Requests Retrieved Successfully", readManagerRequestDTO)
    }

    // 특정 점주신청서 조회
    @Get('/:request_id')
    @Roles(UserRole.ADMIN)
    async readManagerRequestById(
        @Param('request_id') request_id: number
    ): Promise<ApiResponseDTO<ReadManagerRequestDTO>> {
        const managerRequest = await this.managerRequestsService.readManagerRequestById(request_id)
        if (!managerRequest) {
            throw new NotFoundException(`Cannot Find Request by Id ${request_id}`)
        }

        const readManagerRequestDTO = new ReadManagerRequestDTO(managerRequest)
        return new ApiResponseDTO(true, HttpStatus.OK, "Request Retrieved Successfully", readManagerRequestDTO)
    }

    
    // READ - 특정아이디() 점주 신청서 조회 - ///// 바로 위랑 중복되는거인듯? /////
    // @Get('/my-manager-requests')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(UserRole.MANAGER)
    // async readMyManagerRequests(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadManagerRequestDTO[]>> {
    //     const user_id = req.user.user_id

    //     // const foundRequests = await this.managerRequestsService.readManagerRequestByUser(user_id)
    //     const foundRequests = await this.managerRequestsService.readManagerRequestByUser(user_id)
    //     const readManagerRequestDTO = foundRequests.map((request) => new ReadManagerRequestDTO(request))

    //     return new ApiResponseDTO(true, HttpStatus.OK, 'My ManagerRequests Retrieved Successfully', readManagerRequestDTO)
    // }
    

    // UPDATE - 점주신청서 승인 처리 (관리자 전용)
    @Put('/:request_id')
    @Roles(UserRole.ADMIN)
    async updateManagerRequest(
        @Param('request_id') request_id: number,
        @Body() updateManagerRequestDTO: UpdateManagerRequestDTO
    ): Promise<ApiResponseDTO<void>> {
        await this.managerRequestsService.updateManagerRequest(request_id, updateManagerRequestDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, "Request Updated Successfully")
    }

    // DELETE - 점주 신청서 삭제 
    @Delete('/:request_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async deleteManagerRequest(
        @Req() req: AuthenticatedRequest,
        @Param('request_id') request_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundRequest = await this.managerRequestsService.readManagerRequestById(request_id)

        if (foundRequest.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Only Delete Your Own Manager Request.')
        }

        await this.managerRequestsService.deleteManagerRequest(request_id)
        return new ApiResponseDTO(true, HttpStatus.OK, 'Request Deleted Successfully')
    }
}
