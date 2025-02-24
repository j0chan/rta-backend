import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { EventStatus } from "./event-status.enum";

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
    event_status: EventStatus;
    
    @CreateDateColumn({type: "timestamp"})
    created_at: Date;
}
