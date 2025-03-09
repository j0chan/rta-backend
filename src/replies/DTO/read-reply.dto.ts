import { Reply } from "../entities/reply.entity"

export class ReadReplyDTO {
    content: string
    date: Date
    isModified: Boolean

    constructor(reply: Reply) {
        this.content = reply.content
        this.date = reply.isModified ? reply.updated_at : reply.created_at
        this.isModified = reply.isModified
    }
}