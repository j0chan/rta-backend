import { Favorite } from "../entities/favorite.entity"

export class ReadFavoriteDTO {
    store_id: number
    store_name: string
    address: string
    contact_number: string

    constructor(favorite: Favorite) {
        this.store_id = favorite.store.store_id
        this.store_name = favorite.store.store_name
        this.address = favorite.store.address
        this.contact_number = favorite.store.contact_number
    }
}