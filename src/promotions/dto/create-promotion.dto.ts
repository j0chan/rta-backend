import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PromotionPlacement } from '../entities/promotion.entity';

export class CreatePromotionDTO {
  @IsEnum(PromotionPlacement)
  placement: PromotionPlacement;

  @IsOptional()
  @IsString()
  image_url?: string;
}
