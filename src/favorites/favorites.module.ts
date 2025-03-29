import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FavoritesService } from './favorites.service'
import { UsersModule } from 'src/users/users.module'
import { StoresModule } from 'src/stores/stores.module'
import { Favorite } from './entites/favorite.entity'
import { FavoritesController } from './favorites.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    UsersModule,
    StoresModule,
  ],
  providers: [FavoritesService],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoriteModule {}