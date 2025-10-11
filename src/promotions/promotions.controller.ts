import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile, UsePipes, ValidationPipe, HttpStatus, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePromotionDTO } from './dto/create-promotion.dto';
import { Promotion, PromotionPlacement } from './entities/promotion.entity';
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user-role.enum';
import { PromotionService } from './promotions.service';

@Controller('api/promotions')
export class PromotionController {
    constructor(private readonly service: PromotionService) { }

    @Get(':placement')
    async list(@Param('placement') placement: PromotionPlacement): Promise<ApiResponseDTO<Promotion[]>> {
        const data = await this.service.listByPlacement(placement);
        return new ApiResponseDTO(true, HttpStatus.OK, 'Promotions fetched', data);
    }

    @Get('detail/:id')
    async getOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDTO<Promotion>> {
        const data = await this.service.getOne(id);
        return new ApiResponseDTO(true, HttpStatus.OK, 'Promotion fetched', data);
    }

    // ✅ 관리자만 생성: FormData(image) + placement
    @Post('create')
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image')) // 프론트의 fd.append('image', file) 과 일치
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async create(
        @Body() dto: CreatePromotionDTO,
        @UploadedFile() image?: Express.Multer.File,
    ): Promise<ApiResponseDTO<Promotion>> {
        const saved = await this.service.create(dto, image);
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Promotion created', saved);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDTO<void>> {
        await this.service.remove(id);
        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Promotion deleted');
    }
}
