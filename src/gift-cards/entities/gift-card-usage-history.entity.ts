import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { GiftCardPocket } from './gift-card-pocket.entity';

@Entity()
export class GiftCardUsageHistory {
  @PrimaryGeneratedColumn()
  usage_id: number;

  @ManyToOne(() => GiftCardPocket, pocket => pocket.usageHistories, { onDelete: 'CASCADE' })
  pocket: GiftCardPocket;

  @Column({ type: 'int', nullable: true })
  amount_used?: number;

  @Column({ nullable: true })
  store?: string;

  @CreateDateColumn()
  used_at: Date;
}
