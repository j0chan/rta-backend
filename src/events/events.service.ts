import { UpdateEventDTO } from './dto/update-event.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Event } from './entities/event.entity'
import { Repository } from 'typeorm'
import { CreateEventDTO } from './dto/create-event.dto'
import { StoresService } from 'src/stores/stores.service'

@Injectable()
export class EventsService {

    // Event 엔터티 주입
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private storesService: StoresService
    ) { }

    // CREATE
    // 미구현: logger, 에러 처리
    // 비고: 임시 시간값, 임시 스토어 id 사용
    async createEvent(createEventDto: CreateEventDTO): Promise<Event> {
        const { store_id, title, description, start_date, end_date } = createEventDto

        // 가게 객체 가져오기
        const store = await this.storesService.readStoreById(store_id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${store_id} not found`)
        }

        // DTO에서 받은 값을 `Date` 객체로 변환, end_date가 명시되지 않았다면 7일 뒤로 설정
        const startDate = start_date ? new Date(start_date) : new Date()
        const endDate = end_date ? new Date(end_date) : new Date(startDate)
        if (!end_date) {
            endDate.setDate(endDate.getDate() + 7)
        }

        const newEvent: Event = this.eventRepository.create({
            store,
            title,
            description,
            start_date: startDate,
            end_date: endDate,
        })
        const createdEvent = await this.eventRepository.save(newEvent)

        return createdEvent
    }

    // READ[1] - 모든 이벤트 조회
    // 미구현: logger, 에러 처리
    async readAllEvents(): Promise<Event[]> {
        const foundEvents = await this.eventRepository.find()
        if (!foundEvents) {
            throw new NotFoundException(`Cannot Find Events`)
        }

        return foundEvents
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger, 에러 처리
    async readEventById(event_id: number): Promise<Event> {
        const foundEvent = await this.eventRepository.createQueryBuilder('Event')
            .where('Event.event_id = :id', { id: event_id })
            .getOne() as Event
        if (!foundEvent) {
            throw new NotFoundException(`Cannot Find Event by Id ${event_id}`)
        }

        return foundEvent
    }

    // UPDATE - by event_id
    // 미구현: logger, 에러 처리
    async updateEventById(event_id: number, updateEventDTO: UpdateEventDTO) {
        const foundEvent = await this.readEventById(event_id)

        const { title, description, start_date, end_date, event_status } = updateEventDTO

        foundEvent.title = title
        foundEvent.description = description
        foundEvent.start_date = start_date
        foundEvent.end_date = end_date
        foundEvent.event_status = event_status

        await this.eventRepository.save(foundEvent)
    }

    // DELETE
    // 미구현: logger, 에러 처리
    async deleteEventById(event_id: number) {
        const foundEvent = await this.readEventById(event_id)

        await this.eventRepository.remove(foundEvent)
    }
}
