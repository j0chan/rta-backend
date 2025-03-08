import { UserRole } from "../entities/user-role.enum"

export class CreateUserDTO {
    email: string

    password: string

    nickname: string

    phone_number: string

    role: UserRole
}