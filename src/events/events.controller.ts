import { EventsService } from './events.service';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateEventRequestDto } from './dto/create-event-request.dto';
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto';
import { ReadAllEventsRequestDto } from './dto/read-all-events-request.dto';
import { ReadEventRequestDto } from './dto/read-event-request.dto';
import { Event } from './entities/event.entity';

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
    @Get('/:id')
    async readEventById(@Param('id') event_id: number): Promise<ApiResponseDto<ReadEventRequestDto>> {
        const foundEvent: Event = await this.eventsService.readEventById(event_id)
        
        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event List!', new ReadEventRequestDto(foundEvent))
    }

    // UPDATE


    // DELETE

}
