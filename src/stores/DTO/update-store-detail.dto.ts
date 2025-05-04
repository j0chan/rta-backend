import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateStoreDetailDTO {
    @IsNotEmpty()
    @IsString()
    store_name: string

    @IsNotEmpty()
    @IsString()
    owner_name: string

    @IsNotEmpty()
    @IsNumber()
    category_id: number

    @IsNotEmpty()
    @IsString()
    contact_number: string

    @IsOptional()
    @IsString()
    description: string
}