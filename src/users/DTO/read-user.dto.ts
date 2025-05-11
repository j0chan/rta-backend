import { File } from "src/file/entities/file.entity"
import { UserRole } from "../entities/user-role.enum"
import { User } from "../entities/user.entity"

export class ReadUserDTO {
    user_id: number
    email: string
    nickname: string
    phone_number: string
    role: UserRole
    created_at: Date
    profile_image: string

    constructor(user: User) {
        this.user_id = user.user_id
        this.email = user.email
        this.nickname = user.nickname
        this.phone_number = user.phone_number
        this.role = user.role
        this.created_at = user.created_at
        this.profile_image = user.profile_image.url
    }
}