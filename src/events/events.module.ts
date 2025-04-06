import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsService } from './events.service'
import { Event } from './entities/event.entity'
import { EventsController } from './events.controller'
import { StoresModule } from 'src/stores/stores.module'
import { Image } from 'src/s3/entities/images.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        TypeOrmModule.forFeature([Image]),
        StoresModule,
    ],
    providers: [EventsService],
    controllers: [EventsController],
    exports: [EventsService],
})
export class EventsModule { }
