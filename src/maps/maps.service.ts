import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common'
import axios from 'axios'
import { InjectRepository } from '@nestjs/typeorm'
import { Store } from 'src/stores/entities/store.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MapsService {
    private readonly MAP_CLIENT_ID = process.env.MAP_CLIENT_ID
    private readonly MAP_CLIENT_SECRET = process.env.MAP_CLIENT_SECRET
    private readonly MAP_SERVICE_ID = process.env.MAP_SERVICE_ID
    private readonly MAP_SERVICE_SECRET = process.env.MAP_SERVICE_SECRET

    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
    ) {}

    // 클라이언트 ID 반환
    getClientId() {
        /* 에러 점검 */
        console.log('process.env.MAP_CLIENT_ID: ', this.MAP_CLIENT_ID)
        console.log('process.env.MAP_CLIENT_SECRET: ', this.MAP_CLIENT_SECRET)
        console.log('process.env.MAP_SERVICE_ID: ', this.MAP_SERVICE_ID)
        console.log('process.env.MAP_SERVICE_SECRET: ', this.MAP_SERVICE_SECRET)

        return { clientId: this.MAP_CLIENT_ID }
    }

    // 현위치 기준 검색 목록 조회 (map api)
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

    // 현위치 기준 주변 가게 조회
    async readStoreByCurrentLocation(lat: number, lng: number): Promise<any[]> {
        const radius = 3 // km
      
        try {
            const stores = await this.storeRepository.query(
                `
                WITH converted_store AS (
                    SELECT 
                        store_id,
                        store_name,
                        address,
                        latitude,
                        longitude,
                        CASE
                        WHEN latitude BETWEEN 10000000 AND 99999999 THEN latitude / 1000000
                        WHEN latitude BETWEEN 100000000 AND 999999999 THEN latitude / 10000000
                        WHEN latitude BETWEEN 1000000000 AND 9999999999 THEN latitude / 100000000
                        ELSE NULL
                        END AS lat,
                        CASE
                        WHEN longitude BETWEEN 10000000 AND 99999999 THEN longitude / 100000
                        WHEN longitude BETWEEN 100000000 AND 999999999 THEN longitude / 1000000
                        WHEN longitude BETWEEN 1000000000 AND 9999999999 THEN longitude / 10000000
                        ELSE NULL
                        END AS lon,
                        category_id
                    FROM store
                    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                    )
                    SELECT 
                    cs.store_id,
                    cs.store_name,
                    cs.address,
                    cs.latitude,
                    cs.longitude,
                    cs.lat,
                    cs.lon,
                    ROUND(
                        6371 * acos(
                        cos(radians(?)) * cos(radians(cs.lat)) *
                        cos(radians(cs.lon) - radians(?)) +
                        sin(radians(?)) * sin(radians(cs.lat))
                        ), 2
                    ) AS distance_km,
                     cs.category_id,
                    c.category_name
                    FROM converted_store cs
                    JOIN category c ON cs.category_id = c.category_id
                    HAVING distance_km < ?
                    ORDER BY distance_km ASC
                    LIMIT 10
                `,
                [lat, lng, lat, radius]
            )
      
          return stores.map(store => ({
            store_id: store.store_id,
            store_name: store.store_name,
            address: store.address,
            latitude: parseFloat(store.lat),
            longitude: parseFloat(store.lon),
            distance: Math.round(store.distance),
            category: {
                category_id: store.category_id,
                category_name: store.category_name
            }
          }))
      
        } catch (err) {
          console.error('위치 기반 쿼리 오류:', err) // ← 여기 로그 꼭 확인 필요
          throw new InternalServerErrorException('DB 쿼리 실패')
        }
    }

    // map api 주변 음식점 조회
    // async getNearbyStores(lat: number, lng: number) {
    //     try {
    //         // 현재 좌표를 기반으로 주소 얻기
    //         const reverseResponse = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
    //             headers: {
    //                 'X-NCP-APIGW-API-KEY-ID': this.MAP_CLIENT_ID,
    //                 'X-NCP-APIGW-API-KEY': this.MAP_CLIENT_SECRET,
    //             },
    //             params: {
    //                 coords: `${lng},${lat}`,
    //                 orders: 'addr',  // 주소 정보 반환 (기본값: legalcode)
    //                 output: 'json'   // JSON 형식 응답
    //             },
    //         })

    //         // 주소 추출
    //         // const address = reverseResponse.data.results[0].region.area1.name + ' ' +
    //         //                 reverseResponse.data.results[0].region.area2.name + ' ' +
    //         //                 reverseResponse.data.results[0].region.area3.name + ' ' +
    //         //                 reverseResponse.data.results[0].region.area4.name

    //         const region = reverseResponse.data.results[0].region

    //         const address = [region.area1?.name, region.area2?.name, region.area3?.name, region.area4?.name]
    //                         .filter(Boolean)
    //                         .join(' ')

    //         // 현재 주소 근처 음식점 검색
    //         const placesResponse = await axios.get('https://openapi.naver.com/v1/search/local.json', {
    //             headers: {
    //                 'X-Naver-Client-Id': this.MAP_SERVICE_ID,
    //                 'X-Naver-Client-Secret': this.MAP_SERVICE_SECRET,
    //             },
    //             params: {
    //                 query: `음식점 ${address}`,  // 현재 주소를 포함한 음식점 검색
    //                 display: 5,
    //                 start: 1,
    //                 // sort: 'random',
    //                 radius: 1000,  // 반경 1km 내에서 음식점 검색
    //             },
    //         })
    
    //         return placesResponse.data.items.map((item: any) => ({
    //             name: item.title.replace(/<[^>]+>/g, ''),
    //             address: item.address,
    //             lat: parseFloat(item.mapy),
    //             lng: parseFloat(item.mapx),
    //         }))
    //     } catch (error) {
    //         if (error.response) {
    //             console.error('API 요청 실패:', error.response.status, error.response.data)
    //         } else {
    //             console.error('네트워크 오류 또는 API 요청 중 알 수 없는 오류 발생:', error)
    //         }
    //         throw new Error('음식점 정보를 가져오는 데 실패했습니다.')
    //     }
    // }

    // 추천 키워드 기반 외부 장소 검색 후 DB와 매칭
    async findNearbyMatchedAndExternalStores(keyword: string, lat: number, lng: number): Promise<{
        matchedStores: Store[],
        externalPlaces: any[]
    }> {
        const allStores = await this.storeRepository.find();
        const matched: Store[] = [];

        // 지역명 가져오기
        let regionName = '';
        try {
            const reverseResponse = await axios.get('https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc', {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': this.MAP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': this.MAP_CLIENT_SECRET,
                },
                params: {
                    coords: `${lng},${lat}`,
                    orders: 'addr',
                    output: 'json',
                },
            });

            const region = reverseResponse.data.results[0]?.region;

            regionName = region?.area3?.name || region?.area2?.name || ''; // 읍/면/구 수준으로만 사용
        } catch (e) {
            console.error('Reverse geocode 실패:', e.response?.data || e.message || e);
            console.warn('지역명 가져오기 실패, 기본 키워드로 검색 진행');
        }

        // 지역명 포함한 쿼리 구성 (기존 keyword에 추가)
        const query = regionName ? `${regionName} ${keyword}` : keyword;

        const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
            headers: {
                'X-Naver-Client-Id': this.MAP_SERVICE_ID,
                'X-Naver-Client-Secret': this.MAP_SERVICE_SECRET,
            },
            params: {
                query,
                display: 5,
                sort: 'random',
            }
        });

        const items = response.data.items;
        const externalPlaces = items.map(place => ({
            ...place,
            title: place.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()
        }));

        for (const place of externalPlaces) {
            const title = place.title;
            const phone = place.telephone?.replace(/[^0-9]/g, '');

            const match = allStores.find(store => {
                const storePhone = store.contact_number?.replace(/[^0-9]/g, '');
                return (
                    (phone && storePhone && phone === storePhone) ||
                    store.store_name === title ||
                    (place.address && store.address.includes(place.address))
                );
            });

            if (match && !matched.includes(match)) {
                matched.push(match);
            }
        }

        const result = {
            matchedStores: matched,
            externalPlaces,
        };

        console.log('최종 반환값:', result);
        return result;
    }

}
