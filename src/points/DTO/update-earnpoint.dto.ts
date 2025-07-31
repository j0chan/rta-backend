import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class EarnPointDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  reason: string;
}