import { Controller, Get, Query } from '@nestjs/common'
import { MapsService } from './maps.service'

@Controller('api/maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    @Get('/search')
    async searchPlaces(@Query('query') query: string) {
        return this.mapsService.searchPlaces(query)
    }
}
