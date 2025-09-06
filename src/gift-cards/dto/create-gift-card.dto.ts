import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min } from 'class-validator'
import { GiftCardType } from '../entities/gift-card-type.enum'
import { GiftCardCategory } from '../entities/gift-card-category.enum'

export class CreateGiftCardDTO {
    @IsNotEmpty()
    name: string;

    @IsEnum(GiftCardType)
    type: GiftCardType;

    @IsNumber()
    @Min(0)
    amount: number; // 상품권 가격

    @IsEnum(GiftCardCategory)
    category: GiftCardCategory;

    @IsOptional()
    @IsUrl()
    image_url?: string;
}