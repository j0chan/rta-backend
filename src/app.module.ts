import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './users/users.controller'
import { UsersService } from './users/users.service'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresController } from './stores/stores.controller'
import { StoresService } from './stores/stores.service'
import { StoresModule } from './stores/stores.module'
import { EventsController } from './events/events.controller'
import { EventsService } from './events/events.service'
import { EventsModule } from './events/events.module'
import { ReviewsController } from './reviews/reviews.controller'
import { ReviewsService } from './reviews/reviews.service'
import { ReviewsModule } from './reviews/reviews.module'
import { typeOrmConfig } from './config/typeorm.config'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    EventsModule,
    ReviewsModule
  ]
  // controllers: [AppController, UsersController, StoresController, EventsController],
  // providers: [AppService, UsersService, StoresService, EventsService],
})
export class AppModule {}
