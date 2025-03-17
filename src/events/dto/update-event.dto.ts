import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator"

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
    @IsBoolean()
    is_canceled: boolean
}