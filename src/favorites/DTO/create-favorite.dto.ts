import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreateFavoriteDTO {
    @IsNotEmpty()
    @IsNumber()
    user_id: number

    @IsNotEmpty()
    @IsNumber()
    store_id: number
}