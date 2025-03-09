import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"

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

    @ManyToOne(()=> ManagerRequest, (managerRequest) => managerRequest.user)
    manager_requests: ManagerRequest[]
}