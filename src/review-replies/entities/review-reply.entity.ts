import { Review } from "src/reviews/entites/review.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class ReviewReply {
    @PrimaryGeneratedColumn()
    reply_id: number

    // 댓글 삭제 시 대댓글 자동 삭제를 위한 칼럼
    @OneToOne(() => Review, (review) => review.reply, { onDelete: 'CASCADE' })
    @JoinColumn()
    review: Review;

    @Column()
    content: string

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date

    @CreateDateColumn({ type: "timestamp" })
    updated_at: Date
    
    get isModified(): boolean {
        return this.created_at.getTime() !== this.updated_at.getTime()
    }
}
