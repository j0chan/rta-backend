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

    @Column({ default: false })
    is_canceled: boolean

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date

    get eventStatus(): EventStatus {
        if (this.is_canceled) {
            return EventStatus.CANCELED
        }

        const now = new Date()
        if (now < this.start_date) {
            return EventStatus.UPCOMING
        } else if (now >= this.start_date && now <= this.end_date) {
            return EventStatus.ONGOING
        } else {
            return EventStatus.COMPLETED
        }
    }
}
