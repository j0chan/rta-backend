import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { RecommendationService } from './recommendations.service'
import { RecommendationsController } from './recommendations.controller'
import { StoresModule } from '../stores/stores.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://127.0.0.1:8000', // Python FastAPI 서버
      timeout: 5000,
    }),
    StoresModule,
    AuthModule,
  ],
  providers: [RecommendationService],
  controllers: [RecommendationsController],
})
export class RecommendationsModule { }
