import { Type } from "class-transformer"
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator"

export class UpdateEventDTO {
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

    @IsNotEmpty()
    @IsBoolean()
    is_canceled: boolean
}