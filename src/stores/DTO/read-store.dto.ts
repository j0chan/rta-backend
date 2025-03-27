import { User } from "src/users/entities/user.entity"
import { StoreCategory } from "../entities/store-category.enum"
import { Store } from "../entities/store.entity"

export class ReadStoreDTO {
    store_id: number
    user_id: User
    store_name: string
    owner_name: string
    category: StoreCategory
    address: string
    contact_number: string
    description: string
    latitude: number
    longitude: number

    constructor(store: Store) {
        this.store_id = store.store_id
        this.user_id = store.user
        this.store_name = store.store_name
        this.owner_name = store.owner_name
        this.category = store.category
        this.address = store.address
        this.contact_number = store.contact_number 
        this.description = store.description
        this.latitude = store.latitude
        this.longitude = store.longitude
    }
}
