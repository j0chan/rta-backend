import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePromotionDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    image_url: string;

    @IsString()
    @IsIn(['MAIN', 'GIFT_CARD'])
    placement: 'MAIN' | 'GIFT_CARD';
}