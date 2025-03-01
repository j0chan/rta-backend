import { IsNotEmpty, IsString } from "class-validator"

export class CreateReplyDTO {
    @IsNotEmpty()
    @IsString()
    content: string
}