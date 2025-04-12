import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { MenusService } from './menus.service'
import { CreateMenuDTO } from './DTO/create-menu.dto'
import { Menu } from './entities/menu.entity'
import { ReadAllMenusDTO } from './DTO/read-all-menus.dto'
import { ReadMenuDTO } from './DTO/read-menu.dto'
import { UpdateMenuDTO } from './DTO/update-menu.dto'
import { StoresService } from 'src/stores/stores.service'

@Controller('api/stores/:store_id/menus')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class MenusController {
    constructor(
        private menusService: MenusService,
        private storesService: StoresService,
    ) { }

    // CREATE - 새로운 메뉴 등록
    @Post('/')
    @Roles(UserRole.MANAGER)
    async createMenu(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Body() createMenuDTO: CreateMenuDTO
    ): Promise<ApiResponseDTO<Menu>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Create Menu Your Own Store.')
        }

        await this.menusService.createMenu(store_id, createMenuDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Menu Created Successfully!')
    }

    // READ[1] - 해당 가게 모든 메뉴 조회
    @Get('/')
    async readMenusByStore(
        @Param('store_id') store_id: number
    ): Promise<ApiResponseDTO<ReadAllMenusDTO[]>> {
        const menus: Menu[] = await this.menusService.readMenusByStore(store_id)
        const readAllMenusDTO = menus.map(menu => new ReadAllMenusDTO(menu))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Successfully Retrieved All Menus!', readAllMenusDTO)
    }

    // READ[2] - 해당 가게 특정 메뉴 조회
    @Get(':menu_id')
    async readMenuById(
        @Param('menu_id') menu_id: number
    ): Promise<ApiResponseDTO<ReadMenuDTO>> {
        const foundMenu: Menu = await this.menusService.readMenuById(menu_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Successfully Retrieved Event!', new ReadMenuDTO(foundMenu))
    }

    // UPDATE - by menu_id
    @Put(':menu_id')
    @Roles(UserRole.MANAGER)
    async updateMenuById(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Param('menu_id') menu_id: number,
        @Body() updateMenuDTO: UpdateMenuDTO
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Update Menu Your Own Store.')
        }

        const foundMenu = await this.menusService.readMenuById(menu_id)
        if (foundMenu.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Menu Does Not Belong to the Provided Store.')
        }

        await this.menusService.updateMenuById(menu_id, updateMenuDTO)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Menu Updated Successfully!')
    }

    // DELETE - by menu_id
    @Delete(':menu_id')
    @Roles(UserRole.MANAGER)
    async deleteMenuById(
        @Req() req: AuthenticatedRequest,
        @Param('store_id') store_id: number,
        @Param('menu_id') menu_id: number
    ): Promise<ApiResponseDTO<void>> {
        const foundStore = await this.storesService.readStoreById(store_id)
        if (foundStore.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('You Can Delete Menu Your Own Store.')
        }

        const foundMenu = await this.menusService.readMenuById(menu_id)
        if (foundMenu.store.user.user_id !== req.user.user_id) {
            throw new ForbiddenException('This Menu Does Not Belong to the Provided Store.')
        }

        await this.menusService.deleteMenuById(menu_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Menu Deleted Successfully!')
    }
}
