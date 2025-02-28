import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Review } from "./review.entity"

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

    /**
     * if(isModified) {
     *  "수정됨(n일 전)" 출력
     * }
     */
    @Column()
    isModified: boolean = false
}
