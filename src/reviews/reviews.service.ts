import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Review } from './entites/review.entity'
import { Repository } from 'typeorm'
import { CreateReviewRequestDTO } from './DTO/create-review-request.dto'

@Injectable()
export class ReviewsService {

    // Review 엔터티 주입
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>
    ) { }

    // CREATE
    // 미구현: logger, 에러 처리
    // 비고: store_id, user_id, keywords는 원래 DTO로 전달해야 한다. 지금은 안되므로 임시값 사용.
    async createReview(createReviewRequestDTO: CreateReviewRequestDTO): Promise<Review> {
        const { store_id, user_id, content, keywords } = createReviewRequestDTO

        // 임시 store_id
        const tempStoreId: number = 1

        // 임시 user_id
        const tempUserId: number = 2

        // 임시 AI 요약 키워드
        const tempKeywords: string = "임시 AI 요약 키워드들3"


        const newReview: Review = this.reviewRepository.create({
            store_id: tempStoreId,
            user_id: tempUserId,
            content: content,
            keywords: tempKeywords,
            created_at: new Date(),
            updated_at: null
        })

        const createdEvent: Review = await this.reviewRepository.save(newReview)

        return createdEvent
    }

    // READ - 모든 리뷰 조회
    // 미구현: logger, 에러 처리
    async readAllReviews(): Promise<Review[]> {

        const foundReviews = await this.reviewRepository.find()

        return foundReviews
    }
}
