import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { GiftCardType } from '../entities/gift-card-type.enum';

export class CreateGiftCardDTO {
    @IsNotEmpty()
    name: string;

    @IsEnum(GiftCardType)
    type: GiftCardType;

    @IsNumber()
    @Min(0)
    amount: number; // 상풤권 가격
}
