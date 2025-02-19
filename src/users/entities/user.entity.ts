import { UserRole } from "./user-role.enum"

export class User {
    user_id: number
    email: string
    password: string
    nickname: string
    phone_number: string
    role: UserRole
    created_at: Date
}