import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type PromotionPlacement = 'MAIN' | 'GIFT_CARD';

@Entity('promotion')
export class Promotion {
    @PrimaryGeneratedColumn()
    promotion_id: number;

    @Column({ type: 'varchar', length: 500 })
    image_url: string;

    @Index()
    @Column({ type: 'varchar', length: 20 })
    placement: PromotionPlacement;

    @CreateDateColumn()
    created_at: Date;
}