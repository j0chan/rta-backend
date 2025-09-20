import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresModule } from './stores/stores.module'
import { ReviewsModule } from './reviews/reviews.module'
import { typeOrmConfig } from './config/typeorm.config'
import { MapsModule } from './maps/maps.module'
import { OpenaiModule } from './openai/openai.module'
import { ManagerRequestsModule } from './manager-requests/manager-requests.module'
import { RepliesModule } from './replies/replies.module'
import { AuthModule } from './auth/auth.module'
import { FavoriteModule } from './favorites/favorites.module'
import { FileModule } from './file/file.module'
import { EventsModule } from './events/events.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './common/custom-decorators/jwt-auth.guard'
import { RolesGuard } from './common/custom-decorators/custom-role.guard'
import { PointsModule } from './points/points.module'
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { CashModule } from './cash/cash.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    MapsModule,
    ReviewsModule,
    OpenaiModule,
    ManagerRequestsModule,
    RepliesModule,
    AuthModule,
    FavoriteModule,
    FileModule,
    EventsModule,
    PointsModule,
    GiftCardsModule,
    CashModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 먼저 인증
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 그 다음 권한
    },
  ],
  controllers: []
})
export class AppModule { }
