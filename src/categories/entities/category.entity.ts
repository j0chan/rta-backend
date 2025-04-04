import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Store } from "src/stores/entities/store.entity"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    category_id: number

    @Column({ nullable: false })
    category_name: string

    @OneToMany(() => Store, (store) => store.category)
    stores: Store[]
}