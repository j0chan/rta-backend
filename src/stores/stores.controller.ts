import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { ReadStoreDTO } from './DTO/read-store.dto'
import { ReadStoreAddressDTO } from './DTO/read-store-address.dto'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'

@Controller('api/stores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StoresController {
    constructor(private storesService: StoresService) { }

    // CREATE - 새로운 가게 생성하기
    @Post('/')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async createStore(
        @Req() req: AuthenticatedRequest,
        @Body() createStoreDTO: CreateStoreDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        console.log(user_id);
        await this.storesService.createStore(user_id, createStoreDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Store Created Successfully")
    }

    // READ - 매니저가 자신의 가게 조회할 때 사용
    @Get('/my')
    @Roles(UserRole.MANAGER)
    async readAllStoresByUser(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const user_id = req.user.user_id

        const stores = await this.storesService.readAllStoresByUser(user_id)
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, `Stores with user_id ${user_id} Retrieved Successfully`, readStoreDTOs)
    }

    // READ - 모든 가게 조회
    @Get('/')
    async readAllStores(): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readAllStores()
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved Successfully", readStoreDTOs)
    }

    // 특정 가게 상세 정보 조회
    @Get('/:store_id')
    async readStoreById(
        @Param('store_id') id: number
    ): Promise<ApiResponseDTO<ReadStoreDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Retrieved Successfully", new ReadStoreDTO(store))
    }

    // 특정 가게 주소 조회
    @Get('/:store_id/address')
    async readStoreAddressById(
        @Param('store_id') id: number
    ): Promise<ApiResponseDTO<ReadStoreAddressDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Address Retrieved by Id Successfully", new ReadStoreAddressDTO(store))
    }

    // 가게 업종으로 검색(필터링) 조회
    @Get('/')
    async readStoresByCategory(
        @Query('category_id') category_id: number
    ): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readStoresByCategory(category_id)
        const readStoreDTO = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved by Category Successfully", readStoreDTO)
    }

    // UPDATE - 가게 매니저 수정 (관리자 전용)
    @Patch('/:store_id')
    @Roles(UserRole.ADMIN)
    async updateStoreManager(
        @Param('store_id') store_id: number,
        @Body('user_id') user_id: number
    ): Promise<ApiResponseDTO<void>> {
        await this.storesService.updateStoreManager(store_id, user_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Manager Updated Successfully")
    }

    // 가게 정보 수정 (매니저 전용)
    @Put('/:store_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async updateStoreDetail(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Body() updateStoreDetailDTO: UpdateStoreDetailDTO
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Create Store Info Your Own Store.')
        }

        await this.storesService.updateStoreDetail(store_id, updateStoreDetailDTO)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Information Updated Successfully")
    }

    // DELETE
    @Delete('/:store_id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async deleteStore(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Delete Store Info Your Own Store.')
        }

        await this.storesService.deleteStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Deleted Successfully")
    }
}