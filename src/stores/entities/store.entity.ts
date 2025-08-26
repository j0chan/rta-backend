import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Review } from "src/reviews/entities/review.entity"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"
import { User } from "src/users/entities/user.entity"
import { Favorite } from "src/favorites/entities/favorite.entity"
import { Category } from "../../categories/entities/category.entity"
import { Menu } from "src/menus/entities/menu.entity"
import { Event } from "src/events/entities/event.entity"
import { File } from "src/file/entities/file.entity"

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

    @ManyToOne(() => Category, (category) => category.stores)
    @JoinColumn({ name: "category_id" })
    category: Category

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

    @OneToOne(() => File, { nullable: true })
    review_image: File
}