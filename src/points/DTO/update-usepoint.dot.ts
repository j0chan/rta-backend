import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class UsePointDTO {

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    reason: string;
    
}