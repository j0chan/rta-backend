import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { EventsService } from './events.service'
import { CreateEventDTO } from './DTO/create-event.dto'
import { UpdateEventDTO } from './DTO/update-event.dto'
import { ReadAllEventsDTO } from './DTO/read-all-events.dto'
import { ReadEventDTO } from './DTO/read-event.dto'
import { StoresService } from 'src/stores/stores.service'

@Controller('api/stores/:store_id/events')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventsController {
    constructor(
        private eventsService: EventsService,
        private storesService: StoresService,
    ) { }

    // CREATE - 이벤트 생성
    @Post('/')
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

        await this.eventsService.createEvent(store_id, createEventDTO)
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Event Created Successfully')
    }

    // READ - 최근 등록 이벤트 조회 (status: ONGOING 이벤트)
    @Get('latest')
    async readRecentEventByStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readRecentEventByStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // READ - 해당 가게의 모든 이벤트 조회 (생성일 기준 정렬)
    @Get('/')
    async readAllEventsByStore(
        @Param('store_id') store_id: number
    ): Promise<ApiResponseDTO<ReadAllEventsDTO[]>> {
        const events = await this.eventsService.readAllEventsByStore(store_id)
        const readAllEventsDTO = events.map(event => new ReadAllEventsDTO(event))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Events Retrieved Successfully', readAllEventsDTO)
    }

    // READ - 특정 이벤트 상세 조회
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get(':event_id')
    async readEventById(
        @Param('store_id') store_id: number,
        @Param('event_id') event_id: number
    ): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }


    // UPDATE - 자신의 가게 이벤트 수정
    @Put(':event_id')
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

        const foundEvent = await this.eventsService.readEventById(event_id)
        if (foundEvent.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Event Does Not Belong to the Provided Store.')
        }

        await this.eventsService.updateEventById(event_id, updateEventDTO)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully')
    }

    // DELETE - 자신의 가게 이벤트 삭제
    @Delete(':event_id')
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

        const foundEvent = await this.eventsService.readEventById(event_id)
        if (foundEvent.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Event Does Not Belong to the Provided Store.')
        }

        await this.eventsService.deleteEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully')
    }
}
