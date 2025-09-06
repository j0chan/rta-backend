import { Module } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';
import { User } from 'src/users/entities/user.entity';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCard, GiftCardPocket, GiftCardUsageHistory, User]),
    PointsModule, // 구매 시 포인트 트랜잭션 생성을 위한 임포트
  ],
  controllers: [GiftCardsController],
  providers: [GiftCardsService],
})
export class GiftCardsModule { }
