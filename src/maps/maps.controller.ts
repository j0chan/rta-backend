import { Controller, Get, Query } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Controller('api/search')
export class MapsController {
    constructor(private readonly httpService: HttpService) {}

    @Get()
    async searchPlaces(@Query('query') query: string) {

        if (!query) {
            return { error: '검색어를 입력하세요.' }
        }

        const MAP_CLIENT_ID = process.env.MAP_SERVICE_ID
        const MAP_CLIENT_SECRET = process.env.MAP_SERVICE_SECRET

        const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`

        const headers = {
            'X-Naver-Client-Id': MAP_CLIENT_ID,
            'X-Naver-Client-Secret': MAP_CLIENT_SECRET
            // 'Content-Type': 'application/json'
        }

        try {
            console.log('API 호출 시작:', url) // API 호출 전 로그
            const response = await firstValueFrom(this.httpService.get(url, { headers }))
            console.log('API 호출 성공:', response.data) // API 호출 성공 로그
            return response.data.items // 장소 목록 반환
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error) // 오류 발생 로그
            return { error: '검색 중 오류 발생' }
        }
    }
}