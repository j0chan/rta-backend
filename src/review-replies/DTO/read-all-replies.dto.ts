import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { ReviewReply } from "../entities/review-reply.entity"

export class ReadAllRepliesDTO {
    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsDate()
    created_at: Date

    @IsNotEmpty()
    @IsDate()
    updated_at: Date

    constructor(reviewReply: ReviewReply) {
        this.content = reviewReply.content
        this.created_at = reviewReply.created_at
        this.updated_at = reviewReply.updated_at
    }
}