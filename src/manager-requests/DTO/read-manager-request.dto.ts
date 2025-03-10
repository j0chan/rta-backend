import { RequestStatus } from "src/common/request-status.enum"
import { ManagerRequest } from "../entities/manager-requests.entity"

export class ReadManagerRequestDTO {
    request_id: number
    user_id: number
    user_name: string
    store_id: number
    store_name: string
    created_at: Date
    status: RequestStatus
    remark: string

    constructor(managerRequest: ManagerRequest) {
        this.request_id = managerRequest.request_id
        this.user_id = managerRequest.user.user_id
        this.user_name = managerRequest.user.nickname
        this.store_id = managerRequest.store.store_id
        this.store_name = managerRequest.store.store_name
        this.created_at = managerRequest.created_at
        this.status = managerRequest.status
        this.remark = managerRequest.remark
    }
}