import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CashTransaction } from 'src/cash/entities/cash-transaction.entity';

@Entity()
export class UserCash {
    @PrimaryGeneratedColumn()
    user_cash_id: number;

    @OneToOne(() => User, user => user.cash, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ type: 'int', default: 0 })
    balance: number;

    @OneToMany(() => CashTransaction, tx => tx.userCash)
    transactions: CashTransaction[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}