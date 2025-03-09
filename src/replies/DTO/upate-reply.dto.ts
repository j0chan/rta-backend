import { IsNotEmpty, IsString } from "class-validator"

export class UpdateReplyDTO {
    @IsNotEmpty()
    @IsString()
    content: string
}