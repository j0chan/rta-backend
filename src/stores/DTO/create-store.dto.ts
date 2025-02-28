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
    latitude: number

    @IsNotEmpty()
    @IsNumber()
    longitude: number

    @IsNotEmpty()
    @IsString()
    contact_number: string

    @IsString()
    description: string

    constructor(
        store_name: string,
        category: StoreCategory,
        address: string,
        latitude: number,
        longitude: number,
        contact_number: string,
        description: string
    ) {
        this.store_name = store_name
        this.category = category
        this.address = address
        this.latitude = latitude
        this.longitude = longitude
        this.contact_number = contact_number
        this.description = description
    }
}