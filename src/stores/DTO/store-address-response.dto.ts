import { Store } from "../entities/store.entity"

export class StoreAddressResponseDTO {
    address: string
    latitude: number
    longtitude: number

    constructor(store: Store) {
        this.address = store.address
        this.latitude = store.latitude
        this.longtitude = store.longtitude
    }
}