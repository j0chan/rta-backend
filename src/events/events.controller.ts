import { EventsService } from './events.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CreateEventRequestDto } from './dto/create-event-request.dto';
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto';
import { ReadAllEventsRequestDto } from './dto/read-all-events-request.dto';
import { ReadEventRequestDto } from './dto/read-event-request.dto';
import { Event } from './entities/event.entity';
import { UpdateEventRequestDto } from './dto/update-event-request.dto';

@Controller('api/events')
export class EventsController {

    // 생성자 정의
    constructor(private eventsService: EventsService) { }

    // CREATE
    // 미구현: logger
    @Post('/')
    async createEvent(@Body() createEventRequestDto: CreateEventRequestDto): Promise<ApiResponseDto<Event>> {
        await this.eventsService.createEvent(createEventRequestDto)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Event Created Successfully!')
    }

    // READ[1] - 모든 이벤트 조회
    // 미구현: logger
    @Get('/')
    async readAllEvents(): Promise<ApiResponseDto<ReadAllEventsRequestDto[]>> {

        const events: Event[] = await this.eventsService.readAllEvents()
        const readAllEventsRequestDto = events.map(event => new ReadAllEventsRequestDto(event))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event List!', readAllEventsRequestDto)
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger
    // 비고: 이벤트 목록 중 특정 이벤트 클릭 시, 해당 event_id로 이벤트 상세 조회
    @Get('/:event_id')
    async readEventByEventId(@Param('event_id') event_id: number): Promise<ApiResponseDto<ReadEventRequestDto>> {
        const foundEvent: Event = await this.eventsService.readEventByEventId(event_id)
        
        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event!', new ReadEventRequestDto(foundEvent))
    }

    // UPDATE - by event_id
    // 미구현: logger
    @Put('/:event_id')
    async updateEventByEventId(
        @Param('event_id') event_id: number,
        @Body() updateEventRequestDto: UpdateEventRequestDto): Promise<ApiResponseDto<void>> {
        await this.eventsService.updateEventByEventId(event_id, updateEventRequestDto)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Event Updated Successfully!');
    }

    // DELETE - by event_id
    // 미구현: logger
    @Delete('/:event_id')
    async deleteEventById(@Param('event_id') event_id: number): Promise<ApiResponseDto<void>> {
        await this.eventsService.deleteEventByEventId(event_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Event Deleted Successfully!');
    }

}
