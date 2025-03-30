import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateStoreRequestDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number
}