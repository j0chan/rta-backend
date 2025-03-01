import { IsNotEmpty, IsString } from "class-validator"

export class UpdateReviewDTO {
    @IsNotEmpty()
    @IsString()
    content: string
}