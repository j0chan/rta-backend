import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm'
import { GiftCardPocket } from './gift-card-pocket.entity'
import { GiftCardType } from './gift-card-type.enum'
import { GiftCardCategory } from './gift-card-category.enum'

@Entity()
export class GiftCard {
  @PrimaryGeneratedColumn()
  gift_card_id: number;

  @Column()
  name: string;

  @Column()
  type: GiftCardType; // 'EXCHANGE' | 'AMOUNT'

  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'enum',
    enum: GiftCardCategory,
    default: GiftCardCategory.ETC,
  })
  category: GiftCardCategory;

  @Column({ type: 'varchar', length: 512, nullable: true })
  image_url?: string | null;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => GiftCardPocket, pocket => pocket.giftCard)
  pockets: GiftCardPocket[];
}