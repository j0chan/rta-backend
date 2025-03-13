import { EventsService } from './events.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { CreateEventDTO } from './dto/create-event.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { ReadAllEventsDTO } from './dto/read-all-events.dto'
import { ReadEventDTO } from './dto/read-event.dto'
import { Event } from './entities/event.entity'
import { UpdateEventDTO } from './dto/update-event.dto'

@Controller('api/events')
export class EventsController {

    // 생성자 정의
    constructor(private eventsService: EventsService) { }

    // CREATE
    // 미구현: logger
    @Post('/')
    async createEvent(@Body() createEventDto: CreateEventDTO): Promise<ApiResponseDTO<void>> {
        await this.eventsService.createEvent(createEventDto)
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Event Created Successfully')
    }

    // READ[1] - 모든 이벤트 조회
    // 미구현: logger
    @Get('/')
    async readAllEvents(): Promise<ApiResponseDTO<ReadAllEventsDTO[]>> {
        const events = await this.eventsService.readAllEvents()
        const readAllEventsDto = events.map(event => new ReadAllEventsDTO(event))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Events Retrieved Successfully', readAllEventsDto)
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get('/:event_id')
    async readEventById(@Param('event_id') event_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // READ[3] - 최근 등록 이벤트 조회
    // 미구현: logger
    @Get('/latest/:store_id')
    async readEventByCreatedDate(@Body() store_id: number): Promise<ApiResponseDTO<ReadEventDTO>> {
        const foundEvent = await this.eventsService.readEventByCreatedDate(store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', new ReadEventDTO(foundEvent))
    }

    // UPDATE - by event_id
    // 미구현: logger
    @Put('/:event_id')
    async updateEventById(
        @Param('event_id') event_id: number,
        @Body() updateEventDto: UpdateEventDTO): Promise<ApiResponseDTO<void>> {
        await this.eventsService.updateEventById(event_id, updateEventDto)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully')
    }

    // DELETE - by event_id
    // 미구현: logger
    @Delete('/:event_id')
    async deleteEventById(@Param('event_id') event_id: number): Promise<ApiResponseDTO<void>> {
        await this.eventsService.deleteEventById(event_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully')
    }

}
