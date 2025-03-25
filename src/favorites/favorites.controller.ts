import { Controller, Post, Get, Delete, Body, Param, HttpStatus, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { CreateFavoriteDTO } from './DTO/create-favorite.dto'
import { ReadFavoriteDTO } from './DTO/read-favorite.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'

@Controller('api/favorites')
// @UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class FavoritesController {
    constructor(
        private favoritesService: FavoritesService,
    ) {}

    // CREATE
    // 즐겨찾기 추가
    @Post('/')
    async createFavorite(@Body() createFavoriteDTO: CreateFavoriteDTO): Promise<ApiResponseDTO<void>> {
        await this.favoritesService.createFavorite(createFavoriteDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, "Favorite Created Successfully")
    }

    // READ
    // 특정 유저의 즐겨찾기 목록 조회
    @Get('/:user_id')
    async readFavoritesByUser(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadFavoriteDTO[]>> {
        console.log('[백엔드] 요청받은 user_id:', user_id);
        const favorites = await this.favoritesService.readFavoritesByUser(user_id)
        console.log('[백엔드] 조회된 favorites:', favorites);
        const readFavoriteDTOs = favorites.map(favorite => new ReadFavoriteDTO(favorite))

        return new ApiResponseDTO(true, HttpStatus.OK, "Favorites Retrieved Successfully", readFavoriteDTOs)
    }

    // DELETE
    // 즐겨찾기 삭제
    @Delete('/:user_id/:store_id')
    async deleteFavorite(@Param('user_id') user_id: number, @Param('store_id') store_id: number): Promise<ApiResponseDTO<void>> {
        await this.favoritesService.deleteFavorite(user_id, store_id)

        return new ApiResponseDTO(true, HttpStatus.OK, "Favorite Deleted Successfully")
    }
}