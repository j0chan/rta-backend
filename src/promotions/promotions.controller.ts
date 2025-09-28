import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDTO } from './dto/create-promotion.dto';
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user-role.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/promotions')
export class PromotionsController {
    constructor(private readonly service: PromotionsService) { }

    @Get('active')
    async active(@Query('placement') placement: 'MAIN' | 'GIFT_CARD') {
        const data = await this.service.listActiveByPlacement(placement);
        return { ok: true, data };
    }

    // 조회
    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async listAll() {
        const data = await this.service.listAll();
        return { ok: true, data };
    }

    // 생성
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() dto: CreatePromotionDTO) {
        const data = await this.service.create(dto);
        return { ok: true, data };
    }

    // 삭제
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string) {
        await this.service.delete(Number(id));
        return { ok: true };
    }
}