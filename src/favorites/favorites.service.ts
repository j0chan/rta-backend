import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from 'src/users/users.service'
import { StoresService } from 'src/stores/stores.service'
import { Favorite } from './entites/favorite.entity'
import { CreateFavoriteDTO } from './DTO/create-favorite.dto'

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private favoritesRepository: Repository<Favorite>,
        private usersService: UsersService,
        private storesService: StoresService
    ) {}

    async createFavorite(dto: CreateFavoriteDTO): Promise<void> {
        const user = await this.usersService.readUserById(dto.user_id)
        const store = await this.storesService.readStoreById(dto.store_id)
        const favorite = this.favoritesRepository.create({ user, store })
        await this.favoritesRepository.save(favorite)
    }

    async readFavoritesByUser(user_id: number): Promise<Favorite[]> {
        return this.favoritesRepository.find({ where: { user: { user_id } }, relations: ['store']})
    }

    async deleteFavorite(user_id: number, store_id: number): Promise<void> {
        await this.favoritesRepository.delete({ user: { user_id }, store: { store_id } })
    }
}