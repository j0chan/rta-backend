import { IsEnum, IsOptional, IsString } from "class-validator"
import { RequestStatus } from "src/common/request-status.enum"

export class UpdateManagerRequestDTO {
    @IsEnum(RequestStatus)
    status: RequestStatus

    @IsOptional()
    @IsString()
    remark: string
}