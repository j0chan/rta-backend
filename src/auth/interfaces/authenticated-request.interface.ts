import { UserRole } from "src/users/entities/user-role.enum"

export interface AuthenticatedRequest extends Request {
    user: {
        user_id: number
        email: string
        role: UserRole
        profile_image: string
    }
}