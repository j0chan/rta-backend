import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class DepositCashDto {
    @IsInt()
    @Min(1)
    amount: number;

    @IsOptional()
    @IsString()
    memo?: string;
}