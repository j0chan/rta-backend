import { StoreRequest } from "../entities/store-request.entity"
import { RequestStatus } from "../../common/request-status.enum"

export class ReadStoreRequestDTO {
    request_id: number
    user_id: number
    //user_name: string
    store_id: number
    store_name: string
    created_at: Date
    status: RequestStatus
    remark: string

    constructor(storeRequest: StoreRequest) {
        this.request_id = storeRequest.request_id
        this.user_id = storeRequest.user_id
        //this.user_name 
        this.store_id = storeRequest.store.store_id
        this.store_name = storeRequest.store.store_name
        this.created_at = storeRequest.created_at
        this.status = storeRequest.status
        this.remark = storeRequest.remark
    }
}