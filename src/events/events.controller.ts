import { EventsService } from './events.service';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CreateEventRequestDto } from './dto/create-event-request.dto';
import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto';

@Controller('api/events')
export class EventsController {

    // 생성자 정의
    constructor(private eventsService: EventsService) { }

    // CREATE
    // 구현: requestDto, responseDto, promise/async
    // 미구현: logger
    @Post('/')
    async createEvent(@Body() createEventRequestDto: CreateEventRequestDto): Promise<ApiResponseDto<Event>> {
        await this.eventsService.createEvent(createEventRequestDto)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Event Created Successfully!')
    }


    // READ


    // UPDATE


    // DELETE

}
