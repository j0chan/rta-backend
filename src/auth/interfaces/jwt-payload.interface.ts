import { UserRole } from "src/users/entities/user-role.enum"

export interface JwtPayload {
    user_id: number
    email: string
    nickname: string
    role: UserRole
}

