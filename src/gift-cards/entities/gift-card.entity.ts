import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { GiftCardPocket } from './gift-card-pocket.entity';
import { GiftCardType } from './gift-card-type.enum';
import { GiftCategoryCode } from './gift-category-code.enum';

@Entity({ name: 'gift_card' })
export class GiftCard {
  @PrimaryGeneratedColumn()
  gift_card_id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: GiftCardType })
  type: GiftCardType; // 'EXCHANGE' | 'AMOUNT'

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: GiftCategoryCode })
  category: GiftCategoryCode;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => GiftCardPocket, pocket => pocket.giftCard)
  pockets: GiftCardPocket[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}