import { ReviewReply } from "../entities/review-reply.entity"

export class ReadReplyDTO {
    content: string
    date: Date
    isModified: Boolean

    constructor(reviewReply: ReviewReply) {
        this.content = reviewReply.content
        this.date = reviewReply.isModified ? reviewReply.updated_at : reviewReply.created_at
        this.isModified = reviewReply.isModified
    }
}