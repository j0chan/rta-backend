import { Entity, ManyToOne, PrimaryColumn, CreateDateColumn, JoinColumn } from 'typeorm'
import { User } from 'src/users/entities/user.entity'
import { Store } from 'src/stores/entities/store.entity'

@Entity()
export class Favorite {
    @PrimaryColumn()
    user_id: number

    @PrimaryColumn()
    store_id: number

    @ManyToOne(() => User, user => user.favorites, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Store, store => store.favorites, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store

    @CreateDateColumn()
    created_at: Date
}