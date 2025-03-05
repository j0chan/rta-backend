import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateMenuDTO {
    @IsNotEmpty()
    @IsNumber()
    store_id: number

    @IsNotEmpty()
    @IsString()
    menu_name: string

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    manager_container: string
}