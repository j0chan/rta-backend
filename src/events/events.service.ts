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
    async createEvent(store_id: number, createEventDto: CreateEventDTO): Promise<Event> {
        const { title, description, start_date, end_date } = createEventDto

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
    async readAllEvents(store_id: number): Promise<Event[]> {
        const foundEvents = await this.eventRepository.find({
            where: { store: { store_id } }
        })
        if (!foundEvents) {
            throw new NotFoundException(`Cannot Find Events`)
        }

        return foundEvents
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger, 에러 처리
    async readEventById(store_id: number, event_id: number): Promise<Event> {
        const foundEvent = await this.eventRepository.findOne({
            where: {
                store: { store_id },
                event_id
            }
        })
        if (!foundEvent) {
            throw new NotFoundException(`Cannot Find Event by Id ${event_id}`)
        }

        return foundEvent
    }

    // READ[3] - 최근 등록 이벤트 조회
    // 미구현: logger, 에러 처리
    async readEventByCreatedDate(store_id: number): Promise<Event> {
        const foundEvent = await this.eventRepository.findOne({
            where: { store: { store_id } },
            order: { created_at: 'DESC' },
            relations: ['store']
        })
        if (!foundEvent) {
            throw new NotFoundException(`Cannot Find Event In This Store`)
        }

        return foundEvent
    }

    // UPDATE - by event_id
    // 미구현: logger, 에러 처리
    async updateEventById(store_id: number, event_id: number, updateEventDTO: UpdateEventDTO) {
        const foundEvent = await this.readEventById(store_id, event_id)

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
    async deleteEventById(store_id: number, event_id: number) {
        const foundEvent = await this.readEventById(store_id, event_id)

        await this.eventRepository.remove(foundEvent)
    }
}
