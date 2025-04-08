import { ReadReplyDTO } from "src/replies/DTO/read-reply.dto";
import { Review } from "../entites/review.entity";
import { File } from "src/file/entities/file.entity"; // File 엔티티 import

export class ReadReviewDTO {
    review_id: number;
    user_name: string;
    user_id: number;
    store_name: string;
    content: string;
    helpful_count: number;
    reply?: ReadReplyDTO;
    date: Date;
    isModified: Boolean;
    files: File[]; // 파일 배열 추가

    constructor(review: Review) {
        this.review_id = review.review_id;
        this.user_name = review.user.nickname;
        this.user_id = review.user.user_id;
        this.store_name = review.store.store_name;
        this.content = review.content;
        this.helpful_count = review.helpful_count;
        this.reply = review.reply ? new ReadReplyDTO(review.reply) : undefined;
        this.date = review.isModified ? review.updated_at : review.created_at;
        this.isModified = review.isModified;
        this.files = review.files ? review.files : []; // 파일 배열 할당
    }
}