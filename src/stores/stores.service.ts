import { UsersService } from 'src/users/users.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from './entities/store.entity'
import { Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { StoreCategory } from './entities/store-category.enum'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class StoresService {

    // init
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        private usersService: UsersService,
    ) { }

    // CREATE
    // 새로운 가게 생성하기
    async createStore(createStoreDTO: CreateStoreDTO): Promise<number> {
        const { store_name, category, address, latitude, longitude, contact_number, description } = createStoreDTO

        const newStore: Store = this.storesRepository.create({
            store_name,
            category,
            address,
            latitude,
            longitude,
            contact_number,
            description
        })

        await this.storesRepository.save(newStore)

        return newStore.store_id
    }

    // READ
    // 모든 가게 조회
    async readAllStores(): Promise<Store[]> {
        const foundStores = await this.storesRepository.find()

        return foundStores
    }

    // 특정 가게 조회
    async readStoreById(store_id: number): Promise<Store> {
        const foundStore = await this.storesRepository.findOneBy({ store_id: store_id })
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

        await this.storesRepository.update(store_id, { manager: foundUser })
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
