import { IsNumber } from 'class-validator';

export class PurchaseGiftCardDTO {
    @IsNumber()
    gift_card_id: number;
}