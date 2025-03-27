import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { ReadStoreDTO } from './DTO/read-store.dto'
import { ReadStoreAddressDTO } from './DTO/read-store-address.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadReviewDTO } from 'src/reviews/DTO/read-review.dto'
import { ReviewsService } from 'src/reviews/reviews.service'
import { CreateReviewDTO } from 'src/reviews/DTO/create-review.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { CreateEventDTO } from 'src/stores/DTO/create-event.dto'
import { ReadEventDTO } from './DTO/read-event.dto'
import { ReadAllEventsDTO } from './DTO/read-all-events.dto'
import { UpdateEventDTO } from './DTO/update-event.dto'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'

@Controller('api/stores')
@UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class StoresController {
    constructor(
        private storesService: StoresService,
        private reviewsService: ReviewsService,
    ) { }

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ이벤트 관련 기능 시작ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // CREATE - 이벤트 생성
    @Post('/:store_id/events')
    @Roles(UserRole.MANAGER)
    async createEvent(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Body() createEventDTO: CreateEventDTO
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Create Event Your Own Store.')
        }

        await this.storesService.createEvent(store_id, createEventDTO)
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Event Created Successfully')
    }

    // READ - 최근 등록 이벤트 조회 (status: ONGOING 이벤트)
    // 미구현: logger
    @Get('/:store_id/events/latest')
    async readRecentEventByStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.storesService.readRecentEventByStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // READ - 해당 가게의 모든 이벤트 조회 (생성일 기준 정렬)
    // 미구현: logger
    @Get('/:store_id/events')
    async readAllEventsByStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<ReadAllEventsDTO[]>> {
        const events = await this.storesService.readAllEventsByStore(store_id)
        const readAllEventsDTO = events.map(event => new ReadAllEventsDTO(event))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Events Retrieved Successfully', readAllEventsDTO)
    }

    // READ - 특정 이벤트 상세 조회
    // 미구현: logger
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get('/:store_id/events/:event_id')
    async readEventById(
        @Param('event_id') event_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.storesService.readEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // UPDATE - 자신의 가게 이벤트 수정
    // 미구현: logger
    @Put('/:store_id/events/:event_id')
    @Roles(UserRole.MANAGER)
    async updateEventById(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Param('event_id') event_id: number,
        @Body() updateEventDTO: UpdateEventDTO
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Only Update Your Own Store Event.')
        }

        const foundEvent = await this.storesService.readEventById(event_id)
        if (foundEvent.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Event Does Not Belong to the Provided Store.')
        }

        await this.storesService.updateEventById(event_id, updateEventDTO)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully')
    }

    // DELETE - 자신의 가게 이벤트 삭제
    // 미구현: logger
    // jwt를 통해 user_id추출 필요
    @Delete('/:store_id/events/:event_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async deleteEventById(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Param('event_id') event_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Only Delete Your Own Store Event.')
        }

        const foundEvent = await this.storesService.readEventById(event_id)
        if (foundEvent.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Event Does Not Belong to the Provided Store.')
        }

        await this.storesService.deleteEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully')
    }

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ스토어 관련 기능 시작ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // CREATE
    // 새로운 가게 생성하기
    @Post('/')
    @Roles(UserRole.MANAGER)
    async createStore(
        @Req() req: AuthenticatedRequest,
        @Body() createStoreDTO: CreateStoreDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        await this.storesService.createStore(user_id, createStoreDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Store Created Successfully")
    }

    // READ - 매니저가 자신의 가게 조회할 때 사용
    @Get('/my')
    @Roles(UserRole.MANAGER)
    async readAllStoresByUser(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const user_id = req.user.user_id

        const stores = await this.storesService.readAllStoresByUser(user_id)
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, `Stores with user_id ${user_id} Retrieved Successfully`, readStoreDTOs)
    }

    // READ
    // 모든 가게 조회
    @Get('/')
    async readAllStores(): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readAllStores()
        const readStoreDTOs = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved Successfully", readStoreDTOs)
    }

    // 특정 가게 상세 정보 조회
    @Get('/:store_id')
    async readStoreById(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadStoreDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Retrieved Successfully", new ReadStoreDTO(store))
    }

    // 특정 가게 주소 조회
    @Get('/:store_id/address')
    async readStoreAddressById(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadStoreAddressDTO>> {
        const store = await this.storesService.readStoreById(id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Address Retrieved by Id Successfully", new ReadStoreAddressDTO(store))
    }

    // 가게 업종으로 검색(필터링) 조회
    @Get('/')
    async readStoresByCategory(@Query('category') category: StoreCategory): Promise<ApiResponseDTO<ReadStoreDTO[]>> {
        const stores = await this.storesService.readStoresByCategory(category)
        const readStoreDTO = stores.map(store => new ReadStoreDTO(store))

        return new ApiResponseDTO(true, HttpStatus.OK, "Stores Retrieved by Category Successfully", readStoreDTO)
    }

    // UPDATE
    // 가게 매니저 수정 (관리자 전용)
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

    // CREATE
    // 새로운 리뷰 생성
    @Post('/:store_id/reviews')
    @Roles(UserRole.USER)
    async createReview(
        @Param('store_id') store_id: number,
        @Body() createReviewDTO: CreateReviewDTO
    ): Promise<ApiResponseDTO<void>> {
        await this.reviewsService.createReview(store_id, createReviewDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Review Created Successfully!')
    }

    // READ
    // 가게 리뷰 조회
    @Get('/:store_id/reviews')
    async readStoreReviews(@Param('store_id') id: number): Promise<ApiResponseDTO<ReadReviewDTO[]>> {
        const foundReviews = await this.reviewsService.readReviewsByStore(id)
        const readReviewDTOs = foundReviews.map(review => new ReadReviewDTO(review))

        return new ApiResponseDTO(true, HttpStatus.OK, "Store Reviews Retrieved Successfully", readReviewDTOs)
    }
}