import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { MapsController } from './maps.controller'

@Module({
  exports: [HttpModule],
  imports: [HttpModule],
  controllers: [MapsController]
})
export class MapsModule { }
