import { ReviewReply } from "src/review-replies/entities/review-reply.entity"
import { Store } from "src/stores/entities/store.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    review_id: number

    @ManyToOne(() => Store, (store) => store.reviews)
    @JoinColumn({name: "store_id"})
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

    @OneToOne(() => ReviewReply, (reply) => reply.review, { cascade: true, nullable: true })
    reply: ReviewReply

    get isModified(): boolean {
        return this.created_at.getTime() !== this.updated_at.getTime()
    }
}
