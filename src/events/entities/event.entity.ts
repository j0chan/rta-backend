import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { EventStatus } from "./event-status.enum"

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    event_id: number;

    @Column()
    store_id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    start_date: Date;

    @Column()
    end_date: Date;

    @Column()
    event_status: EventStatus = EventStatus.ONGOING;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
}
