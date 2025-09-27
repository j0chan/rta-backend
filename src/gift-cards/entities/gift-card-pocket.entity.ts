import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { GiftCard } from './gift-card.entity';
import { GiftCardUsageHistory } from './gift-card-usage-history.entity';

@Entity()
export class GiftCardPocket {
  @PrimaryGeneratedColumn()
  pocket_id: number; // 개인이 구매한 상품권의 고유 번호

  @ManyToOne(() => User, user => user.gift_card_pocket, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => GiftCard, giftCard => giftCard.pockets, { onDelete: 'CASCADE' })
  giftCard: GiftCard;

  @Column({ type: 'int', default: 0 })
  remaining_amount: number;

  @Column({ default: false })
  is_used: boolean;

  @OneToMany(() => GiftCardUsageHistory, usage => usage.pocket)
  usageHistories: GiftCardUsageHistory[];
}
