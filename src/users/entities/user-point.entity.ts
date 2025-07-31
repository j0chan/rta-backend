import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PointTransaction } from 'src/points/entities/point-transaction.entity';

@Entity()
export class UserPoint {
  @PrimaryGeneratedColumn()
  user_point_id: number;

  @OneToOne(() => User, user => user.point, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'int', default: 0 })
  balance: number;

  @OneToMany(() => PointTransaction, tx => tx.userPoint)
  transactions: PointTransaction[];
}