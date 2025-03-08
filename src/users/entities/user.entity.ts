import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number

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
}