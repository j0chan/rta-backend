import { IsOptional, IsString } from "class-validator"

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    nickname: string
}