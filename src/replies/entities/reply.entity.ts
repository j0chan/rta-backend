import { Review } from "src/reviews/entities/review.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Reply {
    @PrimaryGeneratedColumn()
    reply_id: number

    // 댓글 삭제 시 대댓글 자동 삭제
    @OneToOne(() => Review, (review) => review.reply, { onDelete: 'CASCADE' })
    @JoinColumn({name:"review_id"})
    review: Review

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
