import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { StoreCategory } from "./store-category.enum"
import { User } from "src/users/entities/user.entity"

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    store_id: number

    // @ManyToOne(() => User, (user) => user.user_id)
    @Column()
    user_id: number

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
    longtitude: number

    @Column()
    contact_number: string

    @Column({ nullable: true })
    description: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date
}