import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateStoreDTO {
    @IsNotEmpty()
    @IsString()
    store_name: string

    @IsNotEmpty()
    @IsNumber()
    category_id: number

    @IsNotEmpty()
    @IsString()
    address: string

    @IsNotEmpty()
    @IsNumber()
    latitude: string

    @IsNotEmpty()
    @IsNumber()
    longitude: string

    @IsNotEmpty()
    @IsString()
    contact_number: string

    @IsString()
    description: string

    @IsString()
    area: string
}