import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { CreateEventRequestDto } from './dto/create-event-request.dto';

@Injectable()
export class EventsService {

    // Event 엔터티 주입
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>
    ) { }

    // CREATE
    // 미구현: logger, 에러 처리
    // 비고: 임시 시간값, 임시 스토어 id 사용
    async createEvent(createEventRequestDto: CreateEventRequestDto): Promise<Event> {
        const { store_id, title, description, start_date, end_date } = createEventRequestDto

        // DTO에서 받은 값을 `Date` 객체로 변환, end_date가 명시되지 않았다면 7일 뒤로 설정
        const startDate = start_date ? new Date(start_date) : new Date();
        const endDate = end_date ? new Date(end_date) : new Date(startDate);
        if (!end_date) {
            endDate.setDate(endDate.getDate() + 7);
        }

        // 임시 스토어 id
        const tempStoreId: number = 1

        const newEvent: Event = this.eventRepository.create({
            store_id: tempStoreId,
            title,
            description,
            start_date: startDate,
            end_date: endDate,
        })
        const createdEvent = await this.eventRepository.save(newEvent)

        return createdEvent;
    }

    // READ[1] - 모든 이벤트 조회
    async readAllEvents(): Promise <Event[]> {

        const foundEvents = await this.eventRepository.find()

        return foundEvents
    }
}
