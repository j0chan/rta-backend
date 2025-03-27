import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { StoreCategory } from "../entities/store-category.enum"

export class CreateStoreDTO {
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