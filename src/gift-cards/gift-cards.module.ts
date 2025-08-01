import { Module } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCard, GiftCardPocket, GiftCardUsageHistory, UserPoint, User]),
  ],
  controllers: [GiftCardsController],
  providers: [GiftCardsService],
})
export class GiftCardsModule { }
