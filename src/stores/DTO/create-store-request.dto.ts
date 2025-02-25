import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { StoreCategory } from "../entities/store-category.enum"

export class CreateStoreRequestDTO {
    @IsNotEmpty()
    @IsString()
    store_name: string

    @IsNotEmpty()
    @IsEnum(StoreCategory)
    category: StoreCategory

    @IsNotEmpty()
    @IsString()
    address: string

    @IsNotEmpty()
    @IsNumber()
    latitude: number

    @IsNotEmpty()
    @IsNumber()
    longitude: number

    @IsNotEmpty()
    @IsString()
    contact_number: string

    description: string
}