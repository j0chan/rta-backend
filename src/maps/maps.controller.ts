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
    async getNearbyPlaces(
        @Query('lat') lat: string, // 위도
        @Query('lng') lng: string  // 경도
      ) {
            if (!lat || !lng) {
                return { message: '위도와 경도를 입력하세요.' }
            }
        
            const places = await this.mapsService.getNearbyPlaces(parseFloat(lat), parseFloat(lng))
            return places
        }
}
