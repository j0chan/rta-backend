import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { UserCash } from 'src/users/entities/user-cash.entity';

export enum CashTransactionType {
    DEPOSIT = 'DEPOSIT',       // 충전
    WITHDRAW = 'WITHDRAW',     // 환불
    PAYMENT = 'PAYMENT',       // 결제
    REFUND = 'REFUND',         // 결제 취소 환불
    ADJUSTMENT = 'ADJUSTMENT', // 운영자 정정
}

@Entity()
export class CashTransaction {
    @PrimaryGeneratedColumn()
    cash_transaction_id: number;

    @ManyToOne(() => UserCash, uc => uc.transactions, { onDelete: 'CASCADE' })
    userCash: UserCash;

    @Column({ type: 'enum', enum: CashTransactionType })
    type: CashTransactionType;

    // 항상 양수. 증/감은 type으로 판단
    @Column({ type: 'int' })
    amount: number;

    @Column({ type: 'int' })
    balance_after: number;

    @ManyToOne(() => Store, { nullable: true })
    store?: Store | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    memo?: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
