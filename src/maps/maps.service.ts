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
        const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=음식점&coordinate=${lng},${lat}&radius=${radius}`
        const headers = {
            'X-Naver-Client-Id': MAP_SERVICE_ID,
            'X-Naver-Client-Secret': MAP_SERVICE_SECRET
        }

        try {
            console.log('API 호출 시작:', apiUrl)
            const response = await firstValueFrom(this.httpService.get(apiUrl, { headers }))
            console.log('API 호출 성공:', response.data)

            if (!response.data.items || response.data.items.length === 0) {
                throw new NotFoundException('주변에 음식점이나 카페가 없습니다.')
            }

            return response.data.items // 음식점/카페 데이터 반환
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error)

            if (error.response) {
                throw new HttpException(error.response, error.status)
            }

            throw new InternalServerErrorException('외부 API 호출 중 오류가 발생했습니다.')
        }
    }
}
