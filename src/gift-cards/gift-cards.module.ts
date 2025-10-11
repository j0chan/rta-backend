import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { User } from 'src/users/entities/user.entity';
import { PointTransaction } from 'src/points/entities/point-transaction.entity';
import { FileService } from 'src/file/file.service';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCard, GiftCardPocket, GiftCardUsageHistory, UserPoint, User, PointTransaction]),
    FileModule,
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  ],
  controllers: [
    GiftCardsController,
  ],
  providers: [
    GiftCardsService,
  ],
})
export class GiftCardsModule { }
