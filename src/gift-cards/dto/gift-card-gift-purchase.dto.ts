import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class GiftCardGiftPurchaseDto {
  @IsInt()
  @IsPositive()
  gift_card_id: number;
}

export class RegisterGiftCodeDto {
  @IsString()
  @Length(16, 20)
  gift_code: string;
}