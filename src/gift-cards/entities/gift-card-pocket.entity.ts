import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { GiftCard } from './gift-card.entity';
import { GiftCardUsageHistory } from './gift-card-usage-history.entity';

@Entity({ name: 'gift_card_pocket' })
export class GiftCardPocket {
  @PrimaryGeneratedColumn()
  pocket_id: number; //구매한 상품권의 고유 번호

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })  // nullable로 변경
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GiftCard, giftCard => giftCard.pockets, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'gift_card_id' })
  giftCard: GiftCard;

  @Column({ type: 'int', default: 0 })
  remaining_amount: number;

  @Column({ default: false })
  is_used: boolean;

  @OneToMany(() => GiftCardUsageHistory, usage => usage.pocket)
  usageHistories: GiftCardUsageHistory[];

  // 기프티콘 고유 코드 (선물하기에만 사용, 본인 구매는 null)
  @Column({ unique: true, length: 20, nullable: true })
  gift_code: string;

  // 코드 상태: null(본인구매), PENDING(미등록), REGISTERED(등록완료)
  @Column({
    type: 'enum',
    enum: ['PENDING', 'REGISTERED'],
    nullable: true
  })
  code_status: string;

  // 구매자(선물을 보낸 사람) - 본인 구매 시 null
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payer_user_id' })
  payer: User;

  // 코드 생성 시간 (선물하기에만 사용)
  @CreateDateColumn({ nullable: true })
  code_created_at: Date;

  // 코드 등록 시간 (받는 사람이 코드를 입력한 시간)
  @Column({ type: 'timestamp', nullable: true })
  code_registered_at: Date;

  // 만료 시간 (선택사항 - 예: 생성 후 30일)
  @Column({ type: 'timestamp', nullable: true })
  code_expires_at: Date;
}