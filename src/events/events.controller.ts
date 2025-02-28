import { EventsService } from './events.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { CreateEventDTO } from './dto/create-event.dto'
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto'
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
    async createEvent(@Body() createEventDto: CreateEventDTO): Promise<ApiResponseDto<Event>> {
        await this.eventsService.createEvent(createEventDto)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Event Created Successfully!')
    }

    // READ[1] - 모든 이벤트 조회
    // 미구현: logger
    @Get('/')
    async readAllEvents(): Promise<ApiResponseDto<ReadAllEventsDTO[]>> {

        const events: Event[] = await this.eventsService.readAllEvents()
        const readAllEventsDto = events.map(event => new ReadAllEventsDTO(event))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event List!', readAllEventsDto)
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get('/:event_id')
    async readEventByEventId(@Param('event_id') event_id: number): Promise<ApiResponseDto<ReadEventDTO>> {
        const foundEvent: Event = await this.eventsService.readEventByEventId(event_id)

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event!', new ReadEventDTO(foundEvent))
    }

    // UPDATE - by event_id
    // 미구현: logger
    @Put('/:event_id')
    async updateEventByEventId(
        @Param('event_id') event_id: number,
        @Body() updateEventDto: UpdateEventDTO): Promise<ApiResponseDto<void>> {
        await this.eventsService.updateEventByEventId(event_id, updateEventDto)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully!')
    }

    // DELETE - by event_id
    // 미구현: logger
    @Delete('/:event_id')
    async deleteEventById(@Param('event_id') event_id: number): Promise<ApiResponseDto<void>> {
        await this.eventsService.deleteEventByEventId(event_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully!')
    }

}
