import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Review } from "../entites/review.entity";

export class ReadAllReviewsRequestDTO {
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsString()
    keywords: string

    @IsNotEmpty()
    @IsDate()
    created_at: Date

    @IsNotEmpty()
    @IsBoolean()
    isModified: boolean

    constructor(review: Review) {
        this.user_id = review.user_id
        this.content = review.content
        this.created_at = review.created_at
        this.isModified = review.isModified
    }
}