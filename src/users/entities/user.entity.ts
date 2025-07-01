import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

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

    // @ManyToOne(() => Store, (store) => store.user)
    // stores: Store[]

    // @OneToMany(() => Review, (review) => review.user)
    // reviews: Review[]

    // @OneToMany(() => ManagerRequest, (managerRequest) => managerRequest.user)
    // manager_requests: ManagerRequest[]

    // @OneToMany(() => Favorite, (favorite) => favorite.user)
    // favorites: Favorite[]

    // @OneToOne(() => File, (file) => file.user, { eager: true })
    // profile_image: File
}