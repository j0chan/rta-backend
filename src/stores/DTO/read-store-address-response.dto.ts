import { Store } from "../entities/store.entity"

export class ReadStoreAddressResponseDTO {
    address: string
    latitude: number
    longitude: number

    constructor(store: Store) {
        this.address = store.address
        this.latitude = store.latitude
        this.longitude = store.longitude
    }
}