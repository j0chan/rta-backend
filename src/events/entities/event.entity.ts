import { EventStatus } from "./event-status.enum";

export class Event {
    event_id: number;
    store_id: number;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    event_status: EventStatus;
    created_at: Date;
}
