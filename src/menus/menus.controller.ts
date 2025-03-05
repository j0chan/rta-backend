import { ApiResponseDto } from 'src/common/api-reponse-dto/api-response.dto';
import { CreateMenuDTO } from './DTO/create-menu.dto';
import { MenusService } from './menus.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Menu } from './entities/menu.entity';
import { ReadAllMenusDTO } from './DTO/read-all-menus.dto';
import { ReadMenuDTO } from './DTO/read-menu.dto';
import { UpdateMenuDTO } from './DTO/update-menu.dto';

@Controller('api/menus')
export class MenusController {
    constructor(private menusService: MenusService) { }

    // CREATE - 새로운 메뉴 등록
    // 미구현: logger
    @Post('/')
    async createMenu(@Body() createMenuDTO: CreateMenuDTO): Promise<ApiResponseDto<Menu>> {
        await this.menusService.createMenu(createMenuDTO)
        return new ApiResponseDto(true, HttpStatus.CREATED, 'Menu Registered Successfully!')

    }

    // READ[1] - 해당 가게 모든 메뉴 조회
    // 미구현: logger
    @Get('/')
    async readAllMenus(): Promise<ApiResponseDto<ReadAllMenusDTO[]>> {
        const menus: Menu[] = await this.menusService.readAllMenus()
        const readAllMenusDTO = menus.map(menu => new ReadAllMenusDTO(menu))

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved All Menus!', readAllMenusDTO)
    }

    // READ[2] - 해당 가게 특정 메뉴 조회
    // 미구현: logger
    @Get('/:menu_id')
    async readMenuById(@Param('menu_id') menu_id: number): Promise<ApiResponseDto<ReadMenuDTO>> {
        const foundMenu: Menu = await this.menusService.readMenuById(menu_id)

        return new ApiResponseDto(true, HttpStatus.OK, 'Successfully Retrieved Event!', new ReadMenuDTO(foundMenu))
    }

    // UPDATE - by menu_id
    // 미구현: logger
    @Put('/:menu_id')
    async updateMenuById(
        @Param('menu_id') menu_id: number,
        @Body() updateMenuDTO: UpdateMenuDTO): Promise<ApiResponseDto<void>> {
        await this.menusService.updateMenuById(menu_id, updateMenuDTO)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Menu Updated Successfully!')
    }

    // DELETE - by menu_id
    // 미구현: logger
    @Delete('/:menu_id')
    async deleteMenuById(@Param('menu_id') menu_id: number): Promise<ApiResponseDto<void>> {
        await this.menusService.deleteMenuById(menu_id)
        return new ApiResponseDto(true, HttpStatus.NO_CONTENT, 'Menu Deleted Successfully!')
    }
}
