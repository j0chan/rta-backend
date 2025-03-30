import { UsersService } from 'src/users/users.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { CreateEventDTO } from 'src/stores/DTO/create-event.dto'
import { Event } from './entities/event.entity'
import { UpdateEventDTO } from './DTO/update-event.dto'
import { Menu } from './entities/menu.entity'
import { CreateMenuDTO } from './DTO/create-menu.dto'
import { UpdateMenuDTO } from './DTO/update-menu.dto'
import { Category } from './entities/category.entity'
import { Store } from './entities/store.entity'


@Injectable()
export class StoresService {
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Menu)
        private menusRepository: Repository<Menu>,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,

        private usersService: UsersService,
    ) { }

    // CREATE - 새로운 가게 생성하기
    async createStore(user_id: number, createStoreDTO: CreateStoreDTO): Promise<Store> {
        const { store_name, category, address, latitude, longitude, contact_number, description } = createStoreDTO

        const foundUser = await this.usersService.readUserById(user_id)
        
        const categoryEntity = await this.categoriesRepository.findOneBy({ name: category })

        if (!categoryEntity) {
            throw new NotFoundException(`Category ${category} not found`)
        }

        const newStore: Store = this.storesRepository.create({
            store_name,
            category: categoryEntity,
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

    // READ - 매니저가 자신의 가게 조회할 때 사용
    async readAllStoresByUser(user_id: number): Promise<Store[]> {
        const foundStores = await this.storesRepository.find({
            where: { user: { user_id } }
        })
        if (!foundStores) {
            throw new NotFoundException(`Cannot Find Store With user_id: ${user_id}`)
        }
        return foundStores
    }

    // READ - 모든 가게 조회
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
        const categoryEntity = await this.categoriesRepository.findOneBy({ name: category  })
        
        if (!categoryEntity) {
            throw new NotFoundException(`Category ${category} not found`)
        }

        const foundStores = await this.storesRepository.findBy({ category: categoryEntity })

        return foundStores
    }

    // UPDATE - 가게 매니저 속성 수정 (관리자 전용)
    async updateStoreManager(store_id: number, user_id: number): Promise<void> {
        const foundUser = await this.usersService.readUserById(user_id)

        await this.storesRepository.update(store_id, { user: foundUser })
    }

    // 가게 정보 수정 (매니저 전용)
    async updateStoreDetail(store_id: number, updateStoreDetailDTO: UpdateStoreDetailDTO): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        const { store_name, owner_name, category, contact_number, description } = updateStoreDetailDTO

        const categoryEntity = await this.categoriesRepository.findOneBy({ name: category })

        if (!categoryEntity) {
            throw new NotFoundException(`Category ${category} not found`)
          }

        foundStore.store_name = store_name
        foundStore.owner_name = owner_name
        foundStore.category = categoryEntity
        foundStore.contact_number = contact_number
        foundStore.description = description

        await this.storesRepository.save(foundStore)
    }

    // 가게 비공개 -> 공개 전환
    async updateStoreToPublic(store_id: number): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        await this.storesRepository.update(store_id, { public: true })
    }

    // DELETE - 가게 삭제하기
    async deleteStore(store_id: number): Promise<void> {
        const foundStore = await this.readStoreById(store_id)

        await this.storesRepository.remove(foundStore)
    }
}
