import { Store } from "src/stores/entities/store.entity"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

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

    // 기본적으로 null값, 수정될 때 Date 기입
    @UpdateDateColumn({ type: "timestamp", nullable: true })
    updated_at: Date | null

    @Column()
    isModified: boolean = false
}
