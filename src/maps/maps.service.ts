import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MapsService {
    constructor(private readonly httpService: HttpService) {}

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
}
