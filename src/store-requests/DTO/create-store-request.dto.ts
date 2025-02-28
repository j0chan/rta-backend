import { IsNumber } from "class-validator"

export class CreateStoreRequestDTO {
    @IsNumber()
    user_id: number

    @IsNumber()
    store_id: number
}