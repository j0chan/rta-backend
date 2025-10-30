import { UsersService } from 'src/users/users.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, In, Repository } from 'typeorm'
import { CreateStoreDTO } from './DTO/create-store.dto'
import { UpdateStoreDetailDTO } from './DTO/update-store-detail.dto'
import { Store } from './entities/store.entity'
import { CategoriesService } from 'src/categories/categories.service'

@Injectable()
export class StoresService {
    constructor(
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        private usersService: UsersService,
        private categoriesService: CategoriesService
    ) { }

    // CREATE - 새로운 가게 생성하기
    async createStore(user_id: number, createStoreDTO: CreateStoreDTO): Promise<Store> {
        const { store_name, category_id, address, latitude, longitude, contact_number, description } = createStoreDTO

        const foundUser = await this.usersService.readUserById(user_id)

        const categoryEntity = await this.categoriesService.readCategoryById(category_id)

        if (!categoryEntity) {
            throw new NotFoundException(`Category ${category_id} not found`)
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
            relations: ['user', 'category']
        })

        if (!foundStore) {
            throw new NotFoundException(`Cannot Find Store with ID ${store_id}`)
        }

        return foundStore
    }

    // 가게 업종(category)으로 검색 조회
    async readStoresByCategory(category_id: number): Promise<Store[]> {
        const categoryEntity = await this.categoriesService.readCategoryById(category_id)

        const foundStores = await this.storesRepository.find({
            where: { category: categoryEntity },
            relations: ['category'], // join
        })
        return foundStores
    }

    // 가게 이름(keyword)으로 검색 조회
    async readStoresByKeyword(keyword: string): Promise<Store[]> {
        const foundStores = await this.storesRepository.find({
            where: { store_name: ILike(`%${keyword}%`) },
        })
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

        const { store_name, owner_name, category_id, contact_number, description } = updateStoreDetailDTO

        const categoryEntity = await this.categoriesService.readCategoryById(category_id)

        if (!categoryEntity) {
            throw new NotFoundException(`Category ${category_id} not found`)
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

    async findStoresByIds(store_ids: number[]): Promise<Store[]> {
        if (store_ids.length === 0) {
            return [];
        }

        return this.storesRepository.find({
            where: {
                store_id: In(store_ids),
            },
        });
    }
}
