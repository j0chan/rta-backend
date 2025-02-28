import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { StoreCategory } from "src/stores/entities/store-category.enum"

export class CreateStoreRequestDTO {
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsString()
    store_name: string

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

    @IsString()
    contact_number: string

    @IsString()
    description: string
}