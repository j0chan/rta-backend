import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('notice')
export class Notice {
  @PrimaryGeneratedColumn()
  notice_id: number;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'bool', default: false }) // 중요 공지사항에 사용. true 시 최상단에 공지사항 기제.
  is_pinned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}