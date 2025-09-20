import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { CashTransaction } from './entities/cash-transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { Store } from 'src/stores/entities/store.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { UserCash } from 'src/users/entities/user-cash.entity';
import { PointTransaction } from 'src/points/entities/point-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserCash, CashTransaction, User, Store, UserPoint, PointTransaction,]),
    ],
    controllers: [CashController],
    providers: [CashService],
    exports: [CashService],
})
export class CashModule { }