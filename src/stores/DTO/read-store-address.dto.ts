import { Store } from "../entities/store.entity"

export class ReadStoreAddressDTO {
    address: string
    latitude: string
    longitude: string
    area: string

    constructor(store: Store) {
        this.address = store.address
        this.latitude = store.latitude
        this.longitude = store.longitude
        this.area = store.area
    }
}