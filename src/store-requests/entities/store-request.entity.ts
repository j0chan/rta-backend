import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Store } from "../../stores/entities/store.entity"
import { RequestStatus } from "../../common/request-status.enum"
import { User } from "src/users/entities/user.entity"

@Entity()
export class StoreRequest {
    @PrimaryGeneratedColumn()
    request_id: number

    @ManyToOne(()=> User, { eager: false })
    @JoinColumn({ name: "user_id"})
    user: User

    @OneToOne(() => Store, { eager: false })
    @JoinColumn({ name: "store_id" })
    store: Store

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @Column()
    status: RequestStatus

    @Column({ nullable: true })
    remark: string // 비고 (거절 시 사유)
}
