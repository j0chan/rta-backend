import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"
import { Store } from "src/stores/entities/store.entity"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"
import { Review } from "src/reviews/entities/review.entity"
import { Favorite } from "src/favorites/entities/favorite.entity"
import { File } from "src/file/entities/file.entity"
import { UserPoint } from "./user-point.entity"
import { GiftCardPocket } from "src/gift-cards/entities/gift-card-pocket.entity"


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column()
    nickname: string

    @Column()
    phone_number: string

    @Column()
    role: UserRole

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @OneToMany(() => Store, (store) => store.user)
    stores: Store[]

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[]

    @OneToMany(() => ManagerRequest, (managerRequest) => managerRequest.user)
    manager_requests: ManagerRequest[]

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[]

    @OneToOne(() => File, (file) => file.user, { eager: true })
    profile_image: File

    @OneToOne(() => UserPoint, point => point.user)
    point: UserPoint;

    @OneToMany(() => GiftCardPocket, pocket => pocket.user)
    gift_card_pocket: GiftCardPocket[];
}