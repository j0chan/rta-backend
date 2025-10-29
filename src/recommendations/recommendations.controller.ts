import { Controller, Get, UseGuards } from '@nestjs/common'
import { RecommendationService } from './recommendations.service'
import { JwtAuthGuard } from '../common/custom-decorators/jwt-auth.guard'
import { GetUser } from '../common/custom-decorators/get-user.decorator'
import { User } from '../users/entities/user.entity'

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationService: RecommendationService) { }

  @Get('/')
  async getMyRecommendations(@GetUser() user: User) {
    const userId = user.user_id;

    const criteriaDate = new Date()

    const recommendedIds = await this.recommendationService.getPersonalizedRecommendations(
      userId,
      criteriaDate,
    );

    if (recommendedIds.length === 0) {
      return {
        message: `${userId}번 사용자를 위한 추천 결과가 없습니다.`,
        criteriaDate: criteriaDate.toISOString(),
        recommended_store_ids: [],
      };
    }

    return {
      message: `${userId}번 사용자를 위한 실시간 추천 결과입니다.`,
      criteriaDate: criteriaDate.toISOString(),
      recommended_store_ids: recommendedIds,
    };
  }
}
