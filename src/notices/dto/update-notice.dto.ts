import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNoticeDTO {
    @IsString()
    @IsOptional()
    @MaxLength(200)
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsBoolean()
    @IsOptional()
    is_pinned?: boolean;
}