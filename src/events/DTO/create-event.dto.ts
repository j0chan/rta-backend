import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsString } from "class-validator"

export class CreateEventDTO {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    start_date: Date

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    end_date: Date
}