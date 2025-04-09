import { UpdateReviewDTO } from './DTO/update-review.dto'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Review } from './entites/review.entity'
import { Repository } from 'typeorm'
import { CreateReviewDTO } from './DTO/create-review.dto'
import { StoresService } from 'src/stores/stores.service'
import { Reply } from 'src/replies/entities/reply.entity'
import { UsersService } from 'src/users/users.service'
import { FileService } from 'src/file/file.service'

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name) // Logger 추가

    private reviewRelations = ["user", "reply", "store", "files"]

    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        private storesService: StoresService,
        private usersService: UsersService,
        private fileService: FileService,
    ) { }

    // CREATE [1]
    async createReview(
        store_id: number,
        user_id: number,
        createReviewDTO: CreateReviewDTO, files: Express.Multer.File[]
    ): Promise<Review> {
        const { content } = createReviewDTO

        const user = await this.usersService.readUserById(user_id)
        const store = await this.storesService.readStoreById(store_id)

        const currentDate: Date = new Date()

        const newReview: Review = this.reviewRepository.create({
            store,
            user,
            content,
            created_at: currentDate,
            updated_at: currentDate,
        })

        const createdReview = await this.reviewRepository.save(newReview)
        await this.fileService.uploadImage(files, createdReview)

        return createdReview
    }

    // READ[1] - 모든 리뷰 조회
    async readAllReviews(): Promise<Review[]> {
        const foundReviews = await this.reviewRepository.find({
            relations: this.reviewRelations,
        })

        return foundReviews
    }

    // READ[2] - 특정 리뷰 조회
    async readReviewByReviewId(review_id: number): Promise<Review> {
        const foundReview = await this.reviewRepository.findOne({
            where: { review_id },
            // reply 관계를 포함하여 조회
            relations: ['files', "user"],
        })
        if (!foundReview) {
            throw new NotFoundException(`Cannot Find Review with Id ${review_id}`)
        }

        return foundReview
    }

    // READ[3] - 사용자로 리뷰 필터링
    async readReviewsByUser(user_id: number): Promise<Review[]> {
        // !!!! user 수정되면 검색 방식 교체해야됨 (아래 readReviewsByStore 형식 참고)
        const foundReviews = await this.reviewRepository.find({
            where: { user: { user_id: user_id } },
            relations: this.reviewRelations,
        })

        return foundReviews
    }

    // READ[4] - 가게로 리뷰 필터링
    async readReviewsByStore(store_id: number): Promise<Review[]> {
        const foundReviews = await this.reviewRepository.find({
            where: { store: { store_id: store_id } },
            relations: this.reviewRelations,
        })

        return foundReviews
    }

    // UPDATE[1] - 리뷰 수정
    async updateReviewByReviewId(review_id: number, updateReviewDTO: UpdateReviewDTO): Promise<void> {
        const foundReview = await this.readReviewByReviewId(review_id)

        const currentDate: Date = new Date()

        foundReview.content = updateReviewDTO.content
        foundReview.updated_at = currentDate

        await this.reviewRepository.save(foundReview)
    }

    // UPDATE[2] - 리뷰 도움됐어요 반응
    async markHelpful(review_id: number): Promise<void> {
        const foundReview = await this.readReviewByReviewId(review_id)

        foundReview.helpful_count += 1
        await this.reviewRepository.save(foundReview)
    }

    // UPDATE[3] - 리뷰 대댓글 달릴 시 해당 대댓글 id 업데이트
    async updateReplyId(review_id: number, reply: Reply): Promise<void> {
        const foundReview = await this.readReviewByReviewId(review_id)
        foundReview.reply = reply

        await this.reviewRepository.save(foundReview)
    }

    // DELETE - 리뷰 삭제
    async deleteReviewById(review_id: number): Promise<void> {
        this.logger.log(`deleteReviewById START`)

        const foundReview = await this.readReviewByReviewId(review_id)

        // S3에서 이미지 삭제하는 메서드 호출
        for (const file of foundReview.files) {
            try {
                await this.fileService.deleteImage(file.file_name)
            } catch (error) {
                throw new Error(`Failed to delete file: ${file.file_name}`)
            }
        }

        // DB에서 리뷰 삭제
        await this.reviewRepository.remove(foundReview)
        this.logger.log(`deleteReviewById END`)
    }
}
