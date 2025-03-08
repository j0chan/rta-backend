import { Review } from "../entites/review.entity"

export class ReadAllReviewsDTO {
    user_id: number

    content: string

    created_at: Date

    constructor(review: Review) {
        this.user_id = review.user_id
        this.content = review.content
        this.created_at = review.created_at
    }
}