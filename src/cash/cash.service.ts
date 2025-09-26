import { Injectable, Logger, BadRequestException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Store } from 'src/stores/entities/store.entity';
import { CashTransaction, CashTransactionType, } from './entities/cash-transaction.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { UserCash } from 'src/users/entities/user-cash.entity';
import { DepositCashDto } from './DTO/deposit-cash.dto';
import { WithdrawCashDto } from './DTO/withdraw-cash.dto';
import { PayWithCashDto } from './DTO/pay-with-cash.dto';
import { PointTransaction, PointTransactionType } from 'src/points/entities/point-transaction.entity';

@Injectable()
export class CashService {
    private readonly logger = new Logger(CashService.name);

    /** 결제 시 포인트 적립률 (예: 10%) */
    private readonly earnRate = 0.1;

    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(UserCash)
        private readonly cashRepo: Repository<UserCash>,

        @InjectRepository(CashTransaction)
        private readonly cashTxRepo: Repository<CashTransaction>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,

        // 포인트
        @InjectRepository(UserPoint)
        private readonly pointRepo: Repository<UserPoint>,

        @InjectRepository(PointTransaction)
        private readonly pointTxRepo: Repository<PointTransaction>,
    ) { }

    /** 유저 캐쉬 지갑 조회(없으면 생성) */
    async getOrCreateWallet(userId: number): Promise<UserCash> {
        let wallet = await this.cashRepo.findOne({
            where: { user: { user_id: userId } },
            relations: { user: true },
        });

        if (!wallet) {
            const user = await this.userRepo.findOne({ where: { user_id: userId } });
            if (!user) throw new NotFoundException('User not found');

            wallet = this.cashRepo.create({ user, balance: 0 });
            wallet = await this.cashRepo.save(wallet);
        }

        return wallet;
    }

    /** 내 캐쉬 잔액 */
    async getMyCash(userId: number) {
        const wallet = await this.getOrCreateWallet(userId);
        return {
            user_cash_id: wallet.user_cash_id,
            balance: wallet.balance,
        };
    }

    async getUserCashBalance(userId: number): Promise<number> {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.balance;
    }

    // 캐쉬 이력 조회
    async getUserCashTransactions(user_id: number): Promise<CashTransaction[]> {
        const wallet = await this.cashRepo.findOne({
            where: { user: { user_id } },
        });

        if (!wallet) return [];

        const transactions = await this.cashTxRepo.find({
            where: { userCash: { user_cash_id: wallet.user_cash_id } },
            order: { created_at: 'DESC' },
            relations: { store: true },
        });

        return transactions;
    }

    // 캐쉬 충전
    async deposit(userId: number, dto: DepositCashDto) {
        if (dto.amount <= 0) {
            throw new BadRequestException('amount must be positive');
        }

        return this.dataSource.transaction(async (manager) => {
            const wallet = await this.getOrCreateWallet(userId);

            wallet.balance += dto.amount;
            await manager.getRepository(UserCash).save(wallet);

            const tx = manager.getRepository(CashTransaction).create({
                userCash: wallet,
                type: CashTransactionType.DEPOSIT,
                amount: dto.amount,
                balance_after: wallet.balance,
                reason: dto.memo ?? null,
            });
            await manager.getRepository(CashTransaction).save(tx);

            return {
                balance: wallet.balance,
            };
        });
    }

    // 캐쉬 인출 (예: 환불)
    async withdraw(userId: number, dto: WithdrawCashDto) {
        if (dto.amount <= 0) {
            throw new BadRequestException('amount must be positive');
        }

        return this.dataSource.transaction(async (manager) => {
            const wallet = await this.getOrCreateWallet(userId);

            if (wallet.balance < dto.amount) {
                throw new BadRequestException('잔액이 부족합니다.');
            }

            wallet.balance -= dto.amount;
            await manager.getRepository(UserCash).save(wallet);

            const tx = manager.getRepository(CashTransaction).create({
                userCash: wallet,
                type: CashTransactionType.WITHDRAW,
                amount: dto.amount,
                balance_after: wallet.balance,
                reason: dto.memo ?? null,
            });
            await manager.getRepository(CashTransaction).save(tx);

            return {
                balance: wallet.balance,
            };
        });
    }

    // 캐쉬 결제
    async pay(userId: number, dto: PayWithCashDto) {
        if (dto.amount <= 0) {
            throw new BadRequestException('amount must be positive');
        }

        return this.dataSource.transaction(async (manager) => {
            const wallet = await this.getOrCreateWallet(userId);

            if (wallet.balance < dto.amount) {
                throw new BadRequestException('잔액이 부족합니다.');
            }

            const store = await manager.getRepository(Store).findOne({
                where: { store_id: dto.store_id },
            });
            if (!store) throw new NotFoundException('Store not found');

            // 1) 캐쉬 차감 + 거래기록
            wallet.balance -= dto.amount;
            await manager.getRepository(UserCash).save(wallet);

            const storeLabel =
                (store as any)?.name ??
                (store as any)?.store_name ??
                `store#${dto.store_id}`;

            const cashTx = manager.getRepository(CashTransaction).create({
                userCash: wallet,
                type: CashTransactionType.PAYMENT,
                amount: dto.amount,
                balance_after: wallet.balance,
                store,
                reason: `${storeLabel}`,
            });
            await manager.getRepository(CashTransaction).save(cashTx);

            // 2) 포인트 적립
            const earnPoint = Math.floor(dto.amount * this.earnRate);

            // 포인트 지갑 확보
            let userPoint = await manager.getRepository(UserPoint).findOne({
                where: { user: { user_id: userId } },
                relations: { user: true },
            });
            if (!userPoint) {
                const user = await manager.getRepository(User).findOne({
                    where: { user_id: userId },
                });
                if (!user) throw new NotFoundException('User not found');
                userPoint = manager.getRepository(UserPoint).create({
                    user,
                    balance: 0,
                });
            }

            userPoint.balance += earnPoint;
            await manager.getRepository(UserPoint).save(userPoint);

            const pointTx = manager.getRepository(PointTransaction).create({
                userPoint,
                type: PointTransactionType.EARN,
                amount: earnPoint,
                reason: `${storeLabel}`,
                balance_after: userPoint.balance,
            } as any);
            await manager.getRepository(PointTransaction).save(pointTx);

            return {
                cash: {
                    balance: wallet.balance,
                },
                point: {
                    earned: earnPoint,
                },
            };
        });
    }
}