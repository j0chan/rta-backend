import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import axios from 'axios'

@Injectable()
export class MapsService {
    private readonly MAP_CLIENT_ID = process.env.MAP_CLIENT_ID
    private readonly MAP_CLIENT_SECRET = process.env.MAP_CLIENT_SECRET
    private readonly MAP_SERVICE_ID = process.env.MAP_SERVICE_ID
    private readonly MAP_SERVICE_SECRET = process.env.MAP_SERVICE_SECRET

    constructor(private readonly httpService: HttpService) {}

    // 클라이언트 ID 반환
    getClientId() {
        return { clientId: this.MAP_CLIENT_ID }
    }

    // 현위치 기준 음식점 조회
    async getStoreByName(lat: number, lng: number, query: string) {
        if (!query) {
            throw new BadRequestException('검색어를 입력하세요.')
        }
        if (!lat || !lng) {
            throw new BadRequestException('위치 정보가 필요합니다.')
        }
    
        try {
            // 현재 좌표를 기반으로 주소 얻기
            const reverseResponse = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': this.MAP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': this.MAP_CLIENT_SECRET,
                },
                params: {
                    coords: `${lng},${lat}`,
                    orders: 'addr', // 주소 정보 반환
                    output: 'json', // JSON 형식 응답
                },
            })
    
            const region = reverseResponse.data.results[0].region
    
            // 지역 정보를 우선순위에 따라 배열로 정리
            const regionNames = [region.area4?.name, region.area3?.name, region.area2?.name, region.area1?.name].filter(Boolean)

            let searchResults: any[] = []

            // 검색을 단계적으로 수행하여 최대 5개 결과까지 채우기
            for (const regionName of regionNames) {
                if (searchResults.length >= 5) break // 최대 5개 결과만 반환

                const placesResponse = await axios.get('https://openapi.naver.com/v1/search/local.json', {
                    headers: {
                        'X-Naver-Client-Id': this.MAP_SERVICE_ID,
                        'X-Naver-Client-Secret': this.MAP_SERVICE_SECRET,
                    },
                    params: {
                        query: `${query} ${regionName}`,
                        display: 5, // 최대 5개씩 가져오기
                        start: 1,
                        sort: 'random', // 검색 결과 정렬 방식
                        radius: 1000, // 반경 1km 내에서 검색
                    },
                })

                // 현재 검색 결과를 추가하면서 중복 방지
                const newResults = placesResponse.data.items.map((item: any) => ({
                    store_name: item.title.replace(/<[^>]+>/g, ''), // HTML 태그 제거
                    address: item.address,
                    lat: parseFloat(item.mapy),
                    lng: parseFloat(item.mapx),
                    category: item.category || '음식점',
                    contact_number: item.telephone || '',
                }))

                // 기존 결과와 중복되지 않는 새 결과 추가
                searchResults = [...new Set([...searchResults, ...newResults])].slice(0, 5)
            }

            return searchResults
        } catch (error) {
            if (error.response) {
                console.error('API 요청 실패:', error.response.status, error.response.data)
            } else {
                console.error('네트워크 오류 또는 API 요청 중 알 수 없는 오류 발생:', error)
            }
            throw new Error('음식점 정보를 가져오는 데 실패했습니다.')
        }
    }

    // 주변 음식점 조회
    async getNearbyStores(lat: number, lng: number) {
        try {
            // 현재 좌표를 기반으로 주소 얻기
            const reverseResponse = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': this.MAP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': this.MAP_CLIENT_SECRET,
                },
                params: {
                    coords: `${lng},${lat}`,
                    orders: 'addr',  // 주소 정보 반환 (기본값: legalcode)
                    output: 'json'   // JSON 형식 응답
                },
            })

            // 주소 추출
            // const address = reverseResponse.data.results[0].region.area1.name + ' ' +
            //                 reverseResponse.data.results[0].region.area2.name + ' ' +
            //                 reverseResponse.data.results[0].region.area3.name + ' ' +
            //                 reverseResponse.data.results[0].region.area4.name

            const region = reverseResponse.data.results[0].region

            const address = [region.area1?.name, region.area2?.name, region.area3?.name, region.area4?.name]
                            .filter(Boolean)
                            .join(' ')

            // 현재 주소 근처 음식점 검색
            const placesResponse = await axios.get('https://openapi.naver.com/v1/search/local.json', {
                headers: {
                    'X-Naver-Client-Id': this.MAP_SERVICE_ID,
                    'X-Naver-Client-Secret': this.MAP_SERVICE_SECRET,
                },
                params: {
                    query: `음식점 ${address}`,  // 현재 주소를 포함한 음식점 검색
                    display: 5,
                    start: 1,
                    // sort: 'random',
                    radius: 1000,  // 반경 1km 내에서 음식점 검색
                },
            })
    
            return placesResponse.data.items.map((item: any) => ({
                name: item.title.replace(/<[^>]+>/g, ''),
                address: item.address,
                lat: parseFloat(item.mapy),
                lng: parseFloat(item.mapx),
            }))
        } catch (error) {
            if (error.response) {
                console.error('API 요청 실패:', error.response.status, error.response.data)
            } else {
                console.error('네트워크 오류 또는 API 요청 중 알 수 없는 오류 발생:', error)
            }
            throw new Error('음식점 정보를 가져오는 데 실패했습니다.')
        }
    }
}
