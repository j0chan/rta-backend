import { ReadReplyDTO } from "src/replies/DTO/read-reply.dto"
import { Review } from "../entites/review.entity"
import { File } from "src/file/entities/file.entity" // File 엔티티 import

export class ReadReviewDTO {
    review_id: number
    // user_name: string
    user: {
        id: number
        nickname: string
        profile_image: {
            url: string
        }
    }
    store: {
        store_id: number
        store_name: string
    }
    content: string
    helpful_count: number
    reply?: ReadReplyDTO
    date: Date
    isModified: Boolean
    files: File[]

    constructor(review: Review) {
        this.review_id = review.review_id
        // this.user_name = review.user.nickname
        this.user = {
            id: review.user.user_id,
            nickname: review.user.nickname,
            profile_image: {
                url: review.user.profile_image?.url || '',
            }
        }
        this.store = {
            store_id: review.store.store_id,
            store_name: review.store.store_name
        }
        this.content = review.content
        this.helpful_count = review.helpful_count
        this.reply = review.reply ? new ReadReplyDTO(review.reply) : undefined
        this.date = review.isModified ? review.updated_at : review.created_at
        this.isModified = review.isModified
        this.files = review.files ? review.files : []
    }
}