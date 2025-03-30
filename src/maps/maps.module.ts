import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { MapsController } from './maps.controller'
import { MapsService } from './maps.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Store } from 'src/stores/entities/store.entity'

@Module({
  exports: [HttpModule],
  imports: [
    HttpModule, 
    TypeOrmModule.forFeature([Store])
  ],
  controllers: [MapsController],
  providers: [MapsService]
})
export class MapsModule { }
