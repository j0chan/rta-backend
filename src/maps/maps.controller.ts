import { Controller, Get, Query } from '@nestjs/common'
import { MapsService } from './maps.service'

@Controller('api/maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    // 장소 검색
    @Get('/search')
    async searchPlaces(@Query('query') query: string) {
        return this.mapsService.searchPlaces(query)
    }

    // 주변 장소 검색
    @Get('/nearby')
    async searchNearbyPlaces(
        @Query('lat') lat: string, // 위도
        @Query('lng') lng: string  // 경도
    ) {
        return this.mapsService.searchNearbyPlaces(lat, lng)
    }
}
