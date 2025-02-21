import { StoreCategory } from "./store-category.enum"

export class Store {
    store_id: number
    user_id: number
    store_name: string
    owner_name: string
    category: StoreCategory
    address: string
    latitude: number
    longtitude: number
    contact_number: string
    description: string
    created_at: Date
}