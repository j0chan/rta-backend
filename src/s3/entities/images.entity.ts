import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Images {
    @PrimaryGeneratedColumn()
    image_id: number

    @Column()
    key: string

    @Column()
    url: string

    @CreateDateColumn()
    created_at: Date
}