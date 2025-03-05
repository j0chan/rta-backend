import { Store } from "src/stores/entities/store.entity"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Menu {
    @PrimaryGeneratedColumn()
    menu_id: number

    @Column()
    name: string

    @Column()
    price: number

    @Column({ nullable: true })
    description: string

    // 메뉴 이미지 컬럼 추후 추가
    // @Column()
    // menu_img: 

    @Column({ nullable: true })
    ai_container: string

    @Column({ nullable: true })
    manager_container: string

    @ManyToOne(()=> Store, (store) => store.menus, {cascade: true})
    @JoinColumn({name: "store_id"})
    store: Store
}
