import { IsInt, IsOptional, IsString, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class NoticeQueryDTO {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;

    // 중요 공지만
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isPinnedOnly?: boolean;

    // 일반 공지만
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    excludePinned?: boolean;
}