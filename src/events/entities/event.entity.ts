import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { EventStatus } from "./event-status.enum"
import { Store } from "src/stores/entities/store.entity"

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    event_id: number

    @ManyToOne(() => Store, (store) => store.events)
    @JoinColumn({ name: "store_id" })
    store: Store

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    start_date: Date

    @Column()
    end_date: Date

    @Column()
    event_status: EventStatus = EventStatus.ONGOING

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date
}
