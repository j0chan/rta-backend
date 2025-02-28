import { IsDate, IsNotEmpty, IsString } from "class-validator"
import { EventStatus } from "../entities/event-status.enum"

export class UpdateEventDTO {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsDate()
    start_date: Date

    @IsNotEmpty()
    @IsDate()
    end_date: Date

    @IsNotEmpty()
    event_status: EventStatus
}