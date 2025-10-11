import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { GiftCardType } from '../entities/gift-card-type.enum';
import { GiftCategoryCode } from '../entities/gift-category-code.enum';
import { Type } from 'class-transformer';

export class CreateGiftCardDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(GiftCardType)
    type: GiftCardType; // 'AMOUNT' | 'EXCHANGE'

    @Type(() => Number)        // 문자열 → number 변환
    @IsInt()
    @Min(0)
    amount: number;

    @IsEnum(GiftCategoryCode)
    category: GiftCategoryCode;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    is_active?: boolean; // 옵션으로 받되 기본값 true
}
