import { BadRequestException, Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { MapsService } from './maps.service'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { Public } from 'src/common/custom-decorators/public.decorator'
import { Store } from 'src/stores/entities/store.entity'

@Controller('api/maps')
// @UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    // 클라이언트 ID
    @Public()
    @Get('/client-id')
    getClientId() {
        return this.mapsService.getClientId()
    }

    // 현위치 기준 검색 목록 조회 (map api)
    @Public()
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

    // 현위치 기준 주변 가게 조회
    @Public()
    @Get('/')
    async readStoreByCurrentLocation(
        @Query('lat') lat: string,
        @Query('lng') lng: string
    ) {
        if (!lat || !lng) {
            throw new BadRequestException('위도와 경도를 입력하세요.')
        }

        return await this.mapsService.readStoreByCurrentLocation(parseFloat(lat), parseFloat(lng))
    }

    // map api 주변 음식점 조회
    // @Get('/:lat/:lng')
    // @Roles(UserRole.USER, UserRole.ADMIN)
    // async readNearbyStores(
    //     @Param('lat') lat: string, 
    //     @Param('lng') lng: string  
    // ) {
    //     if (!lat || !lng) {
    //         throw new BadRequestException('위도와 경도를 입력하세요.')
    //     }

    //     return await this.mapsService.getNearbyStores(parseFloat(lat), parseFloat(lng))
    // }

    // 네이버 장소 검색 + DB 매칭
    @Public()
    @Get('naver-match')
    async getMatchedStoresFromNaver(
        @Query('keyword') keyword: string,
        @Query('lat') lat: string,
        @Query('lng') lng: string,
    ) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (!keyword || isNaN(latNum) || isNaN(lngNum)) {
            throw new Error('keyword, lat, lng 모두 필요합니다.');
        }

        return await this.mapsService.findNearbyMatchedAndExternalStores(keyword, latNum, lngNum);
    }

}