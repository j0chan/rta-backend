import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresModule } from './stores/stores.module'
import { ReviewsModule } from './reviews/reviews.module'
import { typeOrmConfig } from './config/typeorm.config'
import { MapsModule } from './maps/maps.module'
import { OpenaiModule } from './openai/openai.module'
import { StoreRequestsModule } from './store-requests/store-requests.module'
import { ManagerRequestsModule } from './manager-requests/manager-requests.module'
import { RepliesModule } from './replies/replies.module'
import { AuthModule } from './auth/auth.module'
import { FavoriteModule } from './favorites/favorites.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    MapsModule,
    ReviewsModule,
    OpenaiModule,
    StoreRequestsModule,
    ManagerRequestsModule,
    RepliesModule,
    UsersModule,
    AuthModule,
    FavoriteModule
  ],
})
export class AppModule { }
