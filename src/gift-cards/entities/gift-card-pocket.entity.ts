import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { GiftCard } from './gift-card.entity';
import { GiftCardUsageHistory } from './gift-card-usage-history.entity';

@Entity({ name: 'gift_card_pocket' })
export class GiftCardPocket {
  @PrimaryGeneratedColumn()
  pocket_id: number; // 개인이 구매한 상품권의 고유 번호

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  user_id: number;

  @ManyToOne(() => GiftCard, giftCard => giftCard.pockets, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'gift_card_id' })
  giftCard: GiftCard;

  @Column({ type: 'int', name: 'gift_card_id' })
  gift_card_id: number;

  @Column({ type: 'int', default: 0 })
  remaining_amount: number;

  @Column({ default: false })
  is_used: boolean;

  @OneToMany(() => GiftCardUsageHistory, usage => usage.pocket)
  usageHistories: GiftCardUsageHistory[];
}