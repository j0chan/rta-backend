import { ReviewReply } from "src/review-replies/entities/review-reply.entity"
import { Store } from "src/stores/entities/store.entity"
import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    review_id: number

    @ManyToOne(() => Store, (store) => store.reviews)
    store: Store

    @Column()
    user_id: number

    @Column()
    content: string

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date

    @CreateDateColumn({ type: "timestamp" })
    updated_at: Date

    @Column({ default: 0 })
    helpful_count: number

    // 매니저 대댓글을 받았는지 여부. 여러번 받기 방지용
    @Column()
    reply_received: boolean = false

    @OneToOne(() => ReviewReply, (reply) => reply.review, { cascade: true })
    reply: ReviewReply

    get isModified(): boolean {
        return this.created_at.getTime() !== this.updated_at.getTime()
    }
}
