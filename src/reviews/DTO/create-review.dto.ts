import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateReviewDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number

    @IsNotEmpty()
    @IsString()
    user_id: number

    @IsNotEmpty()
    @IsString()
    content: string
}