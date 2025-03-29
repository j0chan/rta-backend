import { Menu } from "../entities/menu.entity"

export class ReadMenuDTO {
    menu_name: string
    price: number
    description: string
    ai_container: string
    manager_container: string

    constructor(menu: Menu) {
        this.menu_name = menu.menu_name
        this.price = menu.price
        this.description = menu.description
        this.ai_container = menu.ai_container
        this.manager_container = menu.manager_container
    }
}