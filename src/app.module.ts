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
import { MapsController } from './maps/maps.controller'
import { MapsService } from './maps/maps.service'
import { MapsModule } from './maps/maps.module'
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    EventsModule,
    MapsModule,
    ReviewsModule,
    AuthModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  // controllers: [AppController, UsersController, StoresController, EventsController, MapsController],
  // providers: [AppService, UsersService, StoresService, EventsService, MapsService],
    
})
export class AppModule {}
