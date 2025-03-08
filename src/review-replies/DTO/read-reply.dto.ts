import { ReviewReply } from "../entities/review-reply.entity"
import { Review } from "src/reviews/entites/review.entity"

export class ReadReplyDTO {

    content: string
    created_at: Date
    updated_at: Date
    review: Review

    constructor(reviewReply: ReviewReply) {
        this.content = reviewReply.content
        this.created_at = reviewReply.created_at
        this.updated_at = reviewReply.updated_at
        this.review = reviewReply.review
    }
}