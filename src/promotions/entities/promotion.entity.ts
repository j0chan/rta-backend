import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PromotionPlacement {
    HOME = 'HOME',
    GIFT_CARD = 'GIFT_CARD',
}

@Entity('promotion')
export class Promotion {
    @PrimaryGeneratedColumn()
    promotion_id: number;

    @Column({ type: 'varchar', length: 512, nullable: true })
    image_url?: string | null;

    @Index()
    @Column({ type: 'varchar', length: 20 })
    placement: PromotionPlacement;

    @CreateDateColumn()
    created_at: Date;
}