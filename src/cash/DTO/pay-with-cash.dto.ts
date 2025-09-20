import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class PayWithCashDto {
    @IsInt()
    store_id: number;

    @IsInt()
    @Min(1)
    amount: number;

    @IsOptional()
    @IsString()
    memo?: string;
}