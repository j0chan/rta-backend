import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Store } from "../../stores/entities/store.entity"
import { RequestStatus } from "../../common/request-status.enum"

@Entity()
export class StoreRequest {
    @PrimaryGeneratedColumn()
    request_id: number

    @Column()
    user_id: number

    @OneToOne(() => Store, { eager: true })
    @JoinColumn()
    store: Store

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @Column()
    status: RequestStatus

    @Column({ nullable: true })
    remark: string // 비고 (거절 시 사유)
}