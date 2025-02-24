import { IsDate, IsNotEmpty, IsString } from "class-validator"

export class CreateEventRequestDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    descripition: string

    @IsNotEmpty()
    @IsDate()
    start_date: Date

    @IsNotEmpty()
    @IsDate()
    end_date: Date
}