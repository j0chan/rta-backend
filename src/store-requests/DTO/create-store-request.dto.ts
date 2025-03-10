import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateStoreRequestDTO {
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsNumber()
    store_id: number
}