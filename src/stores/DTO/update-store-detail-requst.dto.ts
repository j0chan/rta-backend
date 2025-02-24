import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { StoreCategory } from "../entities/store-category.enum"

export class UpdateStoreDetailRequestDTO {
    @IsNotEmpty()
    @IsString()
    store_name: string

    @IsNotEmpty()
    @IsString()
    owner_name: string

    @IsNotEmpty()
    @IsEnum(StoreCategory)
    category: StoreCategory

    @IsNotEmpty()
    @IsString()
    contact_number: string

    @IsNotEmpty()
    @IsString()
    description: string
}