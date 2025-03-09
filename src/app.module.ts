import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresModule } from './stores/stores.module'
import { EventsModule } from './events/events.module'
import { ReviewsModule } from './reviews/reviews.module'
import { typeOrmConfig } from './config/typeorm.config'
import { MapsModule } from './maps/maps.module'
import { OpenaiModule } from './openai/openai.module'
import { StoreRequestsModule } from './store-requests/store-requests.module'
import { ManagerRequestsModule } from './manager-requests/manager-requests.module'
import { RepliesModule } from './replies/replies.module'
import { MenusModule } from './menus/menus.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    EventsModule,
    MapsModule,
    ReviewsModule,
    OpenaiModule,
    StoreRequestsModule,
    ManagerRequestsModule,
    RepliesModule,
    MenusModule,
    UsersModule,
    AuthModule
  ],
})
export class AppModule { }
