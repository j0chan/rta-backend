import { Favorite } from "../entites/favorite.entity"

export class ReadFavoriteDTO {
    store_id: number
    store_name: string

    constructor(favorite: Favorite) {
        this.store_id = favorite.store.store_id
        this.store_name = favorite.store.store_name
    }
}