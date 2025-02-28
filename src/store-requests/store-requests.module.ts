import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoreRequest } from './entities/store-request.entity'
import { StoreRequestsService } from './store-requests.service'
import { StoreRequestsController } from './store-requests.controller'
import { StoresModule } from 'src/stores/stores.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([StoreRequest]),
        StoresModule
    ],
    providers: [StoreRequestsService],
    controllers: [StoreRequestsController],
    exports: [StoreRequestsService]
})
export class StoreRequestModule {}
