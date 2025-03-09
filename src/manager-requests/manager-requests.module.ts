import { Module } from '@nestjs/common'
import { ManagerRequestsService } from './manager-requests.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ManagerRequestsController } from './manager-requests.controller'
import { ManagerRequest } from './entities/manager-requests.entity'
import { StoresModule } from 'src/stores/stores.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagerRequest]),
    StoresModule
  ],
  providers: [ManagerRequestsService],
  controllers: [ManagerRequestsController],
  exports: [ManagerRequestsService]
})
export class ManagerRequestsModule { }
