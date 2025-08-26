import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { UploadType } from "./upload-type.enum"
import { Review } from "src/reviews/entities/review.entity"
import { User } from "src/users/entities/user.entity"

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    file_id: number

    // S3에 저장된 파일명
    @Column()
    file_name: string

    // S3에서 접근 가능한 파일 URL
    @Column()
    url: string

    @Column({ type: 'enum', enum: UploadType, default: UploadType.UNCATEGORIZED })
    upload_type: UploadType

    // 확장자(mime)
    @Column()
    content_type: string

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Review, (review) => review.files)
    @JoinColumn({ name: "review_id" })
    review: Review

    @OneToOne(()=>User, (user)=>user.profile_image)
    @JoinColumn({name: "user_id"})
    user: User
}