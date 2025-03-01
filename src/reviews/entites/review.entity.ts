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

    // null 옵션을 없애면 대댓글이 없는 상황에도 reply가 항상 존재해야하기 때문에, null 설정 필요
    @OneToOne(() => ReviewReply, (reply) => reply.review, { cascade: true, nullable: true })
    reply: ReviewReply

    get isModified(): boolean {
        return this.created_at.getTime() !== this.updated_at.getTime()
    }
}
