import { UsersService } from 'src/users/users.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from './entities/store.entity'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { CreateEventDTO } from 'src/stores/DTO/create-event.dto'
import { Event } from './entities/event.entity'
import { UpdateEventDTO } from './DTO/update-event.dto'

@Injectable()
export class StoresService {

    // init
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private usersService: UsersService,
    ) { }

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ이벤트 관련 기능 시작ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // CREATE - 이벤트 생성
    // 미구현: logger, 에러 처리
    // 비고: 임시 시간값 사용
    async createEvent(store_id: number, createEventDTO: CreateEventDTO): Promise<Event> {
        const { title, description, start_date, end_date } = createEventDTO

        // 가게 객체 가져오기
        const store = await this.readStoreById(store_id)
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

    // READ - 최근 등록 이벤트 조회 (status: ONGOING 이벤트)
    // 미구현: logger, 에러 처리
    async readRecentEventByStore(store_id: number): Promise<Event> {
        const now = new Date

        const foundEvent = await this.eventRepository.findOne({
            where: {
                store: { store_id },
                start_date: LessThanOrEqual(now),
                end_date: MoreThanOrEqual(now)
            },
            order: { created_at: 'DESC' },
            relations: ['store']
        })
        if (!foundEvent) {
            throw new NotFoundException(`Cannot Find Event In This Store`)
        }

        return foundEvent
    }

    // READ - 해당 가게의 모든 이벤트 조회 (생성일 기준 정렬)
    // 미구현: logger, 에러 처리
    async readAllEventsByStore(store_id: number): Promise<Event[]> {
        const foundEvents = await this.eventRepository.find({
            where: { store: { store_id } },
            order: { created_at: 'DESC' },
        })
        if (!foundEvents) {
            throw new NotFoundException(`Cannot Find Events`)
        }

        return foundEvents
    }

    // READ - 특정 이벤트 상세 조회
    // 미구현: logger, 에러 처리
    async readEventById(event_id: number): Promise<Event> {
        const foundEvent = await this.eventRepository.findOne({
            where: { event_id },
            relations: ['store.user']
        })
        if (!foundEvent) {
            throw new NotFoundException(`Cannot Find Event by Id ${event_id}`)
        }

        return foundEvent
    }

    // UPDATE - by event_id
    // 미구현: logger, 에러 처리
    async updateEventById(event_id: number, updateEventDTO: UpdateEventDTO) {
        const foundEvent = await this.readEventById(event_id)

        const { title, description, start_date, end_date, is_canceled } = updateEventDTO

        foundEvent.title = title
        foundEvent.description = description
        foundEvent.start_date = start_date
        foundEvent.end_date = end_date
        foundEvent.is_canceled = is_canceled

        await this.eventRepository.save(foundEvent)
    }

    // DELETE
    // 미구현: logger, 에러 처리
    async deleteEventById(event_id: number) {
        const foundEvent = await this.readEventById(event_id)

        await this.eventRepository.remove(foundEvent)
    }

    // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ스토어 관련 기능 시작ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // CREATE
    // 새로운 가게 생성하기
    async createStore(user_id: number, createStoreDTO: CreateStoreDTO): Promise<Store> {
        const { store_name, category, address, latitude, longitude, contact_number, description } = createStoreDTO

        const foundUser = await this.usersService.readUserById(user_id)

        const newStore: Store = this.storesRepository.create({
            store_name,
            category,
            user: foundUser,
            address,
            latitude,
            longitude,
            contact_number,
            description
        })

        await this.storesRepository.save(newStore)

        return newStore
    }

    // READ
    // 특정 유저의 모든 가게 조회
    async readAllStoresByUser(user_id: number): Promise<Store[]> {
        const foundStores = await this.storesRepository.find({
            where: { user: { user_id } }
        })
        if (!foundStores) {
            throw new NotFoundException(`Cannot Find Store With user_id: ${user_id}`)
        }
        return foundStores
    }

    // READ
    // 모든 가게 조회
    async readAllStores(): Promise<Store[]> {
        const foundStores = await this.storesRepository.find()

        return foundStores
    }

    // 특정 가게 조회
    async readStoreById(store_id: number): Promise<Store> {
        const foundStore = await this.storesRepository.findOne({
            where: { store_id },
            relations: ['user'],
        })

        if (!foundStore) {
            throw new NotFoundException(`Cannot Find Store with ID ${store_id}`)
        }

        return foundStore
    }

    // 가게 업종(category)으로 검색 조회
    async readStoresByCategory(category: StoreCategory): Promise<Store[]> {
        const foundStores = await this.storesRepository.findBy({ category: category })

        return foundStores
    }

    // UPDATE
    // 가게 매니저 속성 수정 (관리자 전용)
    async updateStoreManager(store_id: number, user_id: number): Promise<void> {
        const foundUser = await this.usersService.readUserById(user_id)

        await this.storesRepository.update(store_id, { user: foundUser })
    }

    // 가게 정보 수정 (매니저 전용)
    async updateStoreDetail(store_id: number, updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        const { store_name, owner_name, category, contact_number, description } = updateStoreDetailDTO

        foundStore.store_name = store_name
        foundStore.owner_name = owner_name
        foundStore.category = category
        foundStore.contact_number = contact_number
        foundStore.description = description

        await this.storesRepository.save(foundStore)
    }

    // 가게 비공개 -> 공개 전환
    async updateStoreToPublic(store_id: number): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        await this.storesRepository.update(store_id, { public: true })
    }

    // DELETE
    // 가게 삭제하기
    async deleteStore(store_id: number): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        await this.storesRepository.remove(foundStore)
    }
}
