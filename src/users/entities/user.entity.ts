import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./user-role.enum"
import { ManagerRequest } from "src/manager-requests/entities/manager-requests.entity"
import { StoreRequest } from "src/store-requests/entities/store-request.entity"

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

    @OneToMany(()=> ManagerRequest, (managerRequest) => managerRequest.user)
    manager_requests: ManagerRequest[]

    @OneToMany(()=> StoreRequest, (storeRequest)=> storeRequest.user)
    store_requests: StoreRequest[]
}