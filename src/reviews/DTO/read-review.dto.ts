import { ReadReplyDTO } from "src/review-replies/DTO/read-reply.dto"
import { Review } from "../entites/review.entity"

export class ReadReviewDTO {
    review_id: number
    // user_name: string
    store_name: string
    content: string
    helpful_count: number
    reply?: ReadReplyDTO
    date: Date
    isModified: Boolean

    constructor(review: Review) {
        this.review_id = review.review_id
        // this.user_name = 
        this.store_name = review.store.store_name
        this.content = review.content
        this.helpful_count = review.helpful_count
        this.reply = review.reply ? new ReadReplyDTO(review.reply) : undefined
        this.date = review.isModified ? review.updated_at : review.created_at
        this.isModified = review.isModified
    }
}