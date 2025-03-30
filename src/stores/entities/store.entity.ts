import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { StoreCategory } from "./store-category.enum"
import { Review } from "src/reviews/entites/review.entity"
import { StoreRequest } from "../../store-requests/entities/store-request.entity"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"
import { User } from "src/users/entities/user.entity"
import { Favorite } from "src/favorites/entites/favorite.entity"
import { Menu } from "src/menus/entities/menu.entity"
import { Event } from "src/events/entities/event.entity"
import { Image } from "src/s3/entities/images.entity"

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    store_id: number

    @ManyToOne(() => User, (user) => user.stores)
    @JoinColumn({ name: "user_id" })
    user: User

    @OneToMany(() => Review, (review) => review.store)
    reviews: Review[]

    @Column({ nullable: false })
    store_name: string

    @Column({ nullable: true })
    owner_name: string

    @Column({type: 'enum', enum: StoreCategory})
    category: StoreCategory

    @Column()
    address: string

    @Column({ type: 'bigint' })
    latitude: string

    @Column({ type: 'bigint'})
    longitude: string

    @Column()
    contact_number: string

    @Column({ nullable: true })
    description: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @OneToMany(() => Event, (event) => event.store)
    events: Event[]

    @OneToOne(() => StoreRequest)
    storeRequest: StoreRequest

    @OneToMany(() => ManagerRequest, (managerRequest) => managerRequest.store)
    managerRequest: ManagerRequest[]

    @Column({ type: 'boolean', default: false })
    public: boolean

    @OneToMany(() => Menu, (menu) => menu.store)
    menus: Menu[]

    @OneToMany(() => Favorite, (favorite) => favorite.store)
    favorites: Favorite[]

    @Column({ nullable: true })
    area: string

    @OneToOne(() => Image, { nullable: true })
    review_image: Image
}