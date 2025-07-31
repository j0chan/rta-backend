import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserPoint, PointTransaction]),
    ],
    controllers: [PointsController],
    providers: [PointsService],
    exports: [PointsService]
})
export class PointsModule { }
