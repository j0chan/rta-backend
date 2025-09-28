import { UserPoint } from 'src/users/entities/user-point.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

export enum PointTransactionType {
    EARN = 'EARN',
    USE = 'USE',
}

@Entity()
export class PointTransaction {
    @PrimaryGeneratedColumn()
    point_transaction_id: number;

    @ManyToOne(() => UserPoint, userPoint => userPoint.transactions, { onDelete: 'CASCADE', })
    userPoint: UserPoint;

    @Column({ type: 'enum', enum: PointTransactionType, })
    type: PointTransactionType;

    @Column({ type: 'int' })
    amount: number;

    @Column({ type: 'varchar', length: 255 })
    reason: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}