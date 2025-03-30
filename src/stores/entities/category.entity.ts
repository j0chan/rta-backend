import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Store } from "src/stores/entities/store.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    name: string

    @OneToMany(() => Store, (store) => store.category)
    stores: Store[]
}