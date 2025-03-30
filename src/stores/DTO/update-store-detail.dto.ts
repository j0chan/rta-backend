import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { StoreCategory } from "../entities/store-category.enum"

export class UpdateStoreDetailDTO {
    @IsNotEmpty()
    @IsString()
    store_name: string

    @IsNotEmpty()
    @IsString()
    owner_name: string

    @IsNotEmpty()
    @IsString()
    category: string

    @IsNotEmpty()
    @IsString()
    contact_number: string

    @IsNotEmpty()
    @IsString()
    description: string
}