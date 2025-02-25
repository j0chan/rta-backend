import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './users/users.controller'
import { UsersService } from './users/users.service'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';
import { StoresModule } from './stores/stores.module';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { EventsModule } from './events/events.module';
import { MapsController } from './maps/maps.controller';
import { MapsService } from './maps/maps.service';
import { MapsModule } from './maps/maps.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    EventsModule,
    MapsModule
  ],
  controllers: [AppController, UsersController, StoresController, EventsController, MapsController],
  providers: [AppService, UsersService, StoresService, EventsService, MapsService],
})
export class AppModule {}
