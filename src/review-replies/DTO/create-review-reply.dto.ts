import { IsNotEmpty, IsString } from "class-validator"

export class CreateReviewReplyDTO {
    @IsNotEmpty()
    @IsString()
    content: string
}