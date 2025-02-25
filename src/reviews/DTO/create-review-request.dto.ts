import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateReviewRequestDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number

    @IsNotEmpty()
    @IsString()
    user_id: number

    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsString()
    keywords: string
}