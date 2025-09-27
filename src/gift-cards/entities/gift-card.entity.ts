import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';
import { GiftCardPocket } from './gift-card-pocket.entity';
import { GiftCardType } from './gift-card-type.enum';

@Entity()
export class GiftCard {
  @PrimaryGeneratedColumn()
  gift_card_id: number; // 상품권 종류에 대한 고유 번호

  @Column()
  name: string;

  @Column()
  type: GiftCardType; // 'EXCHANGE' or 'AMOUNT'

  @Column({ type: 'int' })
  amount: number;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => GiftCardPocket, pocket => pocket.giftCard)
  pockets: GiftCardPocket[];

  @CreateDateColumn()
  create_at: Date;
}
