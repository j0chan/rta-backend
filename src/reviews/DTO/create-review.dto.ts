import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateReviewDTO {
    @IsNotEmpty()
    @IsString()
    user_id: number

    @IsNotEmpty()
    @IsString()
    content: string
}