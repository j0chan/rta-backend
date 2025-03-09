import { Reply } from "../entities/reply.entity"

export class ReadAllRepliesDTO {
    content: string

    created_at: Date

    updated_at: Date

    constructor(reviewReply: Reply) {
        this.content = reviewReply.content
        this.created_at = reviewReply.created_at
        this.updated_at = reviewReply.updated_at
    }
}