import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { StoreCategory } from "./store-category.enum"
import { Review } from "src/reviews/entites/review.entity"
import { User } from "src/users/entities/user.entity"
import { Event } from "src/events/entities/event.entity"
import { StoreRequest } from "../../store-requests/entities/store-request.entity"
import { Menu } from "src/menus/entities/menu.entity"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    store_id: number

    // @ManyToOne(() => User, (user) => user.user_id)
    @Column()
    user_id: number

    @OneToMany(() => Review, (review) => review.store)
    reviews: Review[]

    @Column({ nullable: false })
    store_name: string

    @Column({ nullable: true })
    owner_name: string

    @Column()
    category: StoreCategory

    @Column()
    address: string

    @Column()
    latitude: number

    @Column()
    longitude: number

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
}