import { IsString, Length, Matches } from 'class-validator';

export class RegisterGiftCodeDto {
  @IsString()
  @Length(16, 20)
  @Matches(/^GIFT-[A-Z0-9]+$/, {
    message: 'Invalid gift code format. Must start with GIFT-'
  })
  gift_code: string;
}