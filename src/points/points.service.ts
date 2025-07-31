import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { Repository } from 'typeorm';
import { PointTransaction, PointTransactionType } from './entities/point-transaction.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PointsService {
    constructor(
        @InjectRepository(UserPoint)
        private userPointRepository: Repository<UserPoint>,

        @InjectRepository(PointTransaction)
        private pointTransactionRepository: Repository<PointTransaction>,
    ) { }

    // 포인트 적립
    async earn(user_id: number, amount: number, reason: string): Promise<number> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be positive');
        }

        const userPoint = await this.userPointRepository.findOne({
            where: { user: { user_id } },
            relations: ['user'],
        });

        if (!userPoint) {
            throw new NotFoundException('UserPoint does not exist.');  // 회원가입 시 생성되지 않은 경우
        }

        userPoint.balance += amount;

        const transaction = this.pointTransactionRepository.create({
            userPoint,
            type: PointTransactionType.EARN,
            amount,
            reason,
        });

        await this.userPointRepository.save(userPoint);
        await this.pointTransactionRepository.save(transaction);

        return amount;
    }


    // 포인트 사용
    async use(user_id: number, amount: number, reason: string): Promise<number> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be positive');
        }

        const userPoint = await this.userPointRepository.findOne({
            where: { user: { user_id } },
            relations: ['user'],
        });

        if (!userPoint || userPoint.balance < amount) {
            throw new BadRequestException('Not enough point balance');
        }

        userPoint.balance -= amount;

        const transaction = this.pointTransactionRepository.create({
            userPoint,
            type: PointTransactionType.USE,
            amount,
            reason,
        });

        await this.userPointRepository.save(userPoint);
        await this.pointTransactionRepository.save(transaction);

        return amount;
    }

    // 포인트 보유량 조회
    async getUserPointTotal(user_id: number): Promise<number> {
        const userPoint = await this.userPointRepository.findOne({
            where: { user: { user_id } },
        });

        return userPoint?.balance ?? 0;
    }

    // 포인트 이력 조회
    async getUserPointTransactions(user_id: number): Promise<PointTransaction[]> {
        const userPoint = await this.userPointRepository.findOne({
            where: { user: { user_id } },
        });

        if (!userPoint) return [];

        const transactions = await this.pointTransactionRepository.find({
            where: { userPoint: { user_point_id: userPoint.user_point_id } },
            order: { created_at: 'DESC' },
        });

        return transactions;
    }
}