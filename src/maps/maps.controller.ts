import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { MapsService } from './maps.service'

@Controller('api/maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    // 클라이언트 ID
    @Get('/client-id')
    getClientId() {
        return this.mapsService.getClientId()
    }

    // 장소 검색
    @Get('/:lat/:lng/:query')
    async readStoreByName(
        @Param('lat') lat: string,  
        @Param('lng') lng: string,
        @Param('query') query: string
    ) {
        if (!query) {
            throw new BadRequestException('검색어를 입력하세요.')
        }
        if (!lat || !lng) {
            throw new BadRequestException('위도와 경도를 입력하세요.')
        }

        return this.mapsService.getStoreByName(parseFloat(lat), parseFloat(lng), query)
    }

    // 주변 음식점 조회
    @Get('/:lat/:lng')
    async readNearbyStores(
        @Param('lat') lat: string, 
        @Param('lng') lng: string  
    ) {
        if (!lat || !lng) {
            throw new BadRequestException('위도와 경도를 입력하세요.')
        }

        return await this.mapsService.getNearbyStores(parseFloat(lat), parseFloat(lng))
    }
}
