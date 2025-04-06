import { ReadReplyDTO } from "src/replies/DTO/read-reply.dto"
import { Review } from "../entites/review.entity"

export class ReadReviewDTO {
    review_id: number
    user_name: string
    store_name: string
    content: string
    helpful_count: number
    reply?: ReadReplyDTO
    date: Date
    isModified: Boolean
    image_urls?: string[]

    constructor(review: Review) {
        this.review_id = review.review_id
        this.user_name = review.user.nickname
        this.store_name = review.store.store_name
        this.content = review.content
        this.helpful_count = review.helpful_count
        this.reply = review.reply ? new ReadReplyDTO(review.reply) : undefined
        this.date = review.isModified ? review.updated_at : review.created_at
        this.isModified = review.isModified
        this.image_urls = review.review_images?.map(rImg => rImg.image?.url).filter(url => !!url) || []
    }
}