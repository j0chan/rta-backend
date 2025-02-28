import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"

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

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date
}