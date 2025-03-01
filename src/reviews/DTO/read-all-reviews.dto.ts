import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Review } from "../entites/review.entity"

export class ReadAllReviewsDTO {
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsDate()
    created_at: Date

    constructor(review: Review) {
        this.user_id = review.user_id
        this.content = review.content
        this.created_at = review.created_at
    }
}