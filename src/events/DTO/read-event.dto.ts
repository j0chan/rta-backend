import { EventStatus } from "../entities/event-status.enum"
import { Event } from "../entities/event.entity"

// 특정 이벤트를 조회할 때 사용하는 Dto
export class ReadEventDTO {
    event_id: number
    store_id: number
    title: string
    description: string
    start_date: Date
    end_date: Date
    event_status: EventStatus
    is_canceled: boolean

    constructor(event: Event) {
        this.event_id = event.event_id
        this.store_id = event.store.store_id
        this.title = event.title
        this.description = event.description
        this.start_date = event.start_date
        this.end_date = event.end_date
        this.event_status = event.eventStatus
        this.is_canceled = event.is_canceled
    }
}