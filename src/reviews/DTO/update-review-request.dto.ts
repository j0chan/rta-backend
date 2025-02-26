import { IsDate, isNotEmpty, IsNotEmpty, IsString } from "class-validator"

export class UpdateReviewRequestDTO {
    @IsNotEmpty()
    @IsString()
    content: string
}