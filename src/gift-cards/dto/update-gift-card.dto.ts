import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateGiftCardDTO {
  @IsNumber()
  pocket_id: number; // 유저와 연결된 상품권 할당 ID

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number; // 금액권일 경우 차감할 금액, 교환권은 1회 사용 후 비활성화

  @IsString()
  store: string; // 사용 장소 (매장이름)
}