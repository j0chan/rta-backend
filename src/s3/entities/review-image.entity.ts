import { Review } from "src/reviews/entites/review.entity";
import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Image } from "./images.entity";

@Entity()
export class ReviewImage {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Review, review => review.review_images, { onDelete: 'CASCADE' })
    review: Review

    @OneToOne(() => Image, { cascade: true, eager: true })
    @JoinColumn()
    image: Image
}