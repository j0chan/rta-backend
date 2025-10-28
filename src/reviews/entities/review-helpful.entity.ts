import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm'
import { User } from 'src/users/entities/user.entity'
import { Review } from './review.entity'

@Entity()
@Unique(['user', 'review'])
export class ReviewHelpful {
  @PrimaryGeneratedColumn({ name: 'helpful_id' })
  helpfulId: number;

  @ManyToOne(() => User, (user) => user.reviewHelpfuls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Review, (review) => review.helpfuls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review
}