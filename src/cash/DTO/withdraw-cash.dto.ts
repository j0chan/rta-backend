import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class WithdrawCashDto {
    @IsInt()
    @Min(1)
    amount: number;

    @IsOptional()
    @IsString()
    memo?: string;
}