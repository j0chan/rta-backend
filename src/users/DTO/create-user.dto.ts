import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { UserRole } from "../entities/user-role.enum"

export class CreateUserDTO {
    @IsNotEmpty()
    @IsString()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    nickname: string

    @IsNotEmpty()
    @IsString()
    phone_number: string
    
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole
}