import { IsDate, IsNotEmpty, IsNumber, isNumber, IsString } from "class-validator"

export class CreateEventDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number

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
}