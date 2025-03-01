import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MapsService {
    constructor(private readonly httpService: HttpService) {}

    // 장소 검색
    async searchPlaces(query: string) {
        if (!query) {
            throw new BadRequestException('검색어를 입력하세요.')
        }

        const MAP_SERVICE_ID = process.env.MAP_SERVICE_ID
        const MAP_SERVICE_SECRET = process.env.MAP_SERVICE_SECRET

        const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`
        const headers = {
            'X-Naver-Client-Id': MAP_SERVICE_ID,
            'X-Naver-Client-Secret': MAP_SERVICE_SECRET
            // 'Content-Type': 'application/json'
        }

        try {
            console.log('API 호출 시작:', url)
            const response = await firstValueFrom(this.httpService.get(url, { headers }))
            console.log('API 호출 성공:', response.data)

            if (!response.data.items || response.data.items.length === 0) {
                throw new NotFoundException('검색 결과가 없습니다.')
            }

            return response.data.items
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error)

            // HttpException이면 원래 응답을 그대로 전달
            if (error.response) {
                throw new HttpException(error.response, error.status)
            }

            throw new InternalServerErrorException('외부 API 호출 중 오류가 발생했습니다.')
        }
    }

    // 주변 검색
    async searchNearbyPlaces(lat: string, lng: string) {
        if (!lat || !lng) {
            throw new BadRequestException('위도와 경도가 필요합니다.')
        }

        const MAP_SERVICE_ID = process.env.MAP_SERVICE_ID
        const MAP_SERVICE_SECRET = process.env.MAP_SERVICE_SECRET

        const radius = 3000 // 검색 반경 3km
        const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=음식점&coordinate=${lng},${lat}&display=30` // 최대 30개까지 조회
        const headers = {
            'X-Naver-Client-Id': MAP_SERVICE_ID,
            'X-Naver-Client-Secret': MAP_SERVICE_SECRET
        }

        try {
            console.log('API 호출 시작:', apiUrl)
            const response = await firstValueFrom(this.httpService.get(apiUrl, { headers }))
            console.log('API 호출 성공:', response.data)

            if (!response.data.items || response.data.items.length === 0) {
                throw new NotFoundException('주변에 음식점이 없습니다.')
            }

            // 반경 내 필터링
            const filteredPlaces = response.data.items.filter((place: any) => {
                // 좌표 변환
                const placeLat = parseFloat(place.mapy) / 1e7
                const placeLng = parseFloat(place.mapx) / 1e7
                return this.getDistance(parseFloat(lat), parseFloat(lng), placeLat, placeLng) <= radius
            })

            if (filteredPlaces.length === 0) {
                // throw new NotFoundException('반경 3km 내에 음식점이 없습니다.')
                console.warn('3km 반경 내 음식점이 없음. data:', response.data.items)
                return []
            }

            return filteredPlaces
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error)
            if (error.response) {
                throw new HttpException(error.response, error.status)
            }
            throw new InternalServerErrorException('외부 API 호출 중 오류가 발생했습니다.')
        }
    }

    // 위도/경도를 이용한 거리 계산
    getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3 // 지구 반경 (미터)
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lng2 - lng1) * Math.PI) / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // 거리 (미터)
    }
}
