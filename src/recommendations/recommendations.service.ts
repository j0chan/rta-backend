import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

// Python API의 요청/응답 형태
interface RecommendRequestDto {
  user_id: number;
  meal_time_code: number;
  day_of_week: number;
  top_k: number;
}

interface RecommendResponseDto {
  recommended_store_ids: number[];
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly httpService: HttpService) { }


  async getPersonalizedRecommendations(
    userId: number,
    createdAt: Date,
  ): Promise<number[]> {
    // 1. createdAt(Date 객체)을 meal_time_code와 day_of_week로 변환
    const { meal_time_code, day_of_week } = this._getCodesFromDate(createdAt);

    // 2. Python FastAPI 서버로 보낼 요청 Body 구성
    const requestBody: RecommendRequestDto = {
      user_id: userId,
      meal_time_code,
      day_of_week,
      top_k: 10,
    };

    try {
      this.logger.log(`추천 API 호출: ${JSON.stringify(requestBody)}`);

      // 3. FastAPI 서버의 /recommend 엔드포인트로 POST 요청
      const response = await firstValueFrom(
        this.httpService.post<RecommendResponseDto>('/recommend', requestBody),
      );

      this.logger.log(`추천 API 응답: ${JSON.stringify(response.data)}`);
      return response.data.recommended_store_ids;
    } catch (error) {
      // 4. API 호출 실패 시 에러 처리
      const axiosError = error as AxiosError;
      this.logger.error(
        `추천 API 호출 실패: ${axiosError.message}`,
        axiosError.stack,
      );

      return [];
    }
  }


  // Date 객체를 meal_time_code와 day_of_week로 변환

  private _getCodesFromDate(
    date: Date,
  ): { meal_time_code: number; day_of_week: number } {
    const hour = date.getHours();
    const jsDay = date.getDay(); // JS: 0(일)-6(토)

    // Day of Week 변환 (JS -> Python)
    const day_of_week = jsDay === 0 ? 6 : jsDay - 1; // Python: 0(월)-6(일)

    // Meal Time Code 변환
    let meal_time_code: number;
    if (hour >= 6 && hour < 11) {
      meal_time_code = 0; // 아침
    } else if (hour >= 11 && hour < 17) {
      meal_time_code = 1; // 점심
    } else if (hour >= 17 && hour < 22) {
      meal_time_code = 2; // 저녁
    } else {
      meal_time_code = 3; // 야식 (22:00 ~ 05:59)
    }

    return { meal_time_code, day_of_week };
  }
}
