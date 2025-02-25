import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    review_id: number

    @Column()
    store_id: number

    @Column()
    user_id: number

    @Column()
    content: string

    @Column()
    keywords: string

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    // 기본적으로 null값, 수정되었다면 Date 변경
    updated_at: Date | null;

    @Column()
    isModified: boolean = false
}
