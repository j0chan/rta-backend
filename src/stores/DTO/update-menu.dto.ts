import { IsNotEmpty, IsNumber, IsString } from "class-validator"
export class UpdateMenuDTO {
    @IsNotEmpty()
    @IsString()
    menu_name: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsNotEmpty()
    @IsString()
    manager_container: string
}