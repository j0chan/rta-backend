import { UpdateMenuDTO } from './DTO/update-menu.dto'
import { StoresService } from './../stores/stores.service'
import { CreateMenuDTO } from './DTO/create-menu.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Menu } from './entities/menu.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MenusService {

    // init
    constructor(
        @InjectRepository(Menu)
        private menusRepository: Repository<Menu>,
        private storesService: StoresService
    ) { }

    // CREATE - 새로운 메뉴 등록
    // 미구현: logger, 에러 처리
    async createMenu(store_id: number, createMenuDTO: CreateMenuDTO): Promise<Menu> {
        const { menu_name, price, description, manager_container } = createMenuDTO

        // 가게 객체 가져오기
        const store = await this.storesService.readStoreById(store_id)
        if (!store) {
            throw new NotFoundException(`Store with ID ${store_id} not found`)
        }

        const newMenu: Menu = this.menusRepository.create({
            store,
            menu_name,
            price,
            description,
            manager_container,
        })

        const createdMenu = await this.menusRepository.save(newMenu)

        return createdMenu
    }

    // READ[1] - 해당 가게 모든 메뉴 조회
    // 미구현: logger, 에러 처리
    async readAllMenus(store_id: number): Promise<Menu[]> {
        const foundMenus = await this.menusRepository.find({
            where: { store: { store_id } }
        })
        if (!foundMenus) {
            throw new NotFoundException(`Cannot Find Menus`)
        }

        return foundMenus
    }

    // READ[2] - 특정 이벤트 상세 조회
    // 미구현: logger, 에러 처리
    async readMenuById(store_id: number, menu_id: number): Promise<Menu> {
        const foundMenu = await this.menusRepository.findOne({
            where: {
                store: { store_id }, 
                menu_id
            }
        })
        if (!foundMenu) {
            throw new NotFoundException(`Cannot Find Event By Id ${menu_id}`)
        }
        return foundMenu
    }

    // UPDATE - by menu_id
    // 미구현: logger, 에러 처리
    async updateMenuById(store_id: number, menu_id: number, updateMenuDTO: UpdateMenuDTO) {
        const foundMenu = await this.readMenuById(store_id, menu_id)

        const { menu_name, description, price, manager_container } = updateMenuDTO
        foundMenu.menu_name = menu_name
        foundMenu.description = description
        foundMenu.price = price
        foundMenu.manager_container = manager_container

        await this.menusRepository.save(foundMenu)
    }

    // DELETE
    // 미구현: logger, 에러 처리
    async deleteMenuById(store_id: number, menu_id: number) {
        const foundMenu = await this.readMenuById(store_id, menu_id)
        if (foundMenu) {
            await this.menusRepository.remove(foundMenu)
        }
    }
}
