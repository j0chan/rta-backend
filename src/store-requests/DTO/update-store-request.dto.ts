import { IsEnum, IsNumber, IsString } from "class-validator"
import { RequestStatus } from "../../stores/entities/request-status.enum"

export class UpdateStoreRequestDTO {
    @IsEnum(RequestStatus)
    status: RequestStatus

    @IsString()
    remark: string
}