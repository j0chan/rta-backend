import { IsEnum, IsString } from "class-validator"
import { RequestStatus } from "../../common/request-status.enum"

export class UpdateStoreRequestDTO {
    @IsEnum(RequestStatus)
    status: RequestStatus

    @IsString()
    remark: string
}