import { RequestStatus } from "src/common/request-status.enum"
import { Store } from "src/stores/entities/store.entity"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class ManagerRequest {
    @PrimaryGeneratedColumn()
    request_id: number

    @Column()
    user_id: number

    @ManyToOne(() => Store, { eager: true })
    store: Store

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @Column()
    status: RequestStatus

    @Column({ nullable: true })
    remark: string // 비고 (거절 시 사유)
}