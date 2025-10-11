import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn } from 'typeorm';
import { GiftCardPocket } from './gift-card-pocket.entity';

@Entity({ name: 'gift_card_usage_history' })
export class GiftCardUsageHistory {
  @PrimaryGeneratedColumn()
  usage_id: number;

  @ManyToOne(() => GiftCardPocket, pocket => pocket.usageHistories, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'pocket_id' })
  pocket: GiftCardPocket;

  @Column({ type: 'int', name: 'pocket_id' })
  pocket_id: number;

  @Column({ type: 'int', nullable: true })
  amount_used?: number;

  @Column({ nullable: true })
  store?: string;

  @CreateDateColumn()
  used_at: Date;
}
