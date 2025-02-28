import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresService } from './stores.service'
import { StoresController } from './stores.controller'
import { Store } from './entities/store.entity'
import { StoreRequest } from './entities/store-request.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Store, StoreRequest])
    ],
    providers: [StoresService],
    controllers: [StoresController],
    exports: [StoresService]
})
export class StoresModule {}
