import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateManagerRequestDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number
}