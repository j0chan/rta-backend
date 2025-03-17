import { EventsService } from './events.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { CreateEventDTO } from './DTO/create-event.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadAllEventsDTO } from './DTO/read-all-events.dto'
import { ReadEventDTO } from './DTO/read-event.dto'
import { UpdateEventDTO } from './DTO/update-event.dto'

@Controller('api/stores/:store_id/events')
export class EventsController {

    // 생성자 정의
    constructor(private eventsService: EventsService) { }

    // CREATE
    // 미구현: logger
    @Post('/')
    async createEvent(
        @Param('store_id') store_id: number,
        @Body() createEventDTO: CreateEventDTO): Promise<ApiResponseDTO<void>> {
        await this.eventsService.createEvent(store_id, createEventDTO)
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Event Created Successfully')
    }

    // READ[3] - 최근 등록 이벤트 조회 (status: ONGOING 이벤트)
    // 미구현: logger
    // 비고: Get요청들 중 최상단에 배치해야 정확히 라우팅함.
    @Get('/latest')
    async readRecentEventByStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readRecentEventByStore(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // READ[1] - 해당 가게의 모든 이벤트 조회 (생성일 기준 정렬)
    // 미구현: logger
    @Get('/')
    async readAllEventsByStore(@Param('store_id') store_id: number): Promise<ApiResponseDTO<ReadAllEventsDTO[]>> {
        const events = await this.eventsService.readAllEventsByStore(store_id)
        const readAllEventsDTO = events.map(event => new ReadAllEventsDTO(event))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Events Retrieved Successfully', readAllEventsDTO)
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get('/:event_id')
    async readEventById(
        @Param('event_id') event_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // UPDATE - by event_id
    // 미구현: logger
    @Put('/:event_id')
    async updateEventById(
        @Param('event_id') event_id: number,
        @Body() updateEventDTO: UpdateEventDTO): Promise<ApiResponseDTO<void>> {
        await this.eventsService.updateEventById(event_id, updateEventDTO)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully')
    }

    // UPDATE - 이벤트 상태 취소로 변경
    @Put('/:event_id/cancel')
    async cancelEvent(@Param('event_id') event_id: number): Promise<ApiResponseDTO<void>> {
        await this.eventsService.cancelEvent(event_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Canceled Successfully')
    }

    // DELETE - by event_id
    // 미구현: logger
    @Delete('/:event_id')
    async deleteEventById(
        @Param('event_id') event_id: number): Promise<ApiResponseDTO<void>> {
        await this.eventsService.deleteEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully')
    }

}
