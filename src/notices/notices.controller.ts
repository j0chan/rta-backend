import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseIntPipe, UseGuards, Logger, } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDTO } from './dto/create-notice.dto';
import { UpdateNoticeDTO } from './dto/update-notice.dto';
import { NoticeQueryDTO } from './dto/notice-query.dto';
import { Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard';
import { UserRole } from 'src/users/entities/user-role.enum';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

type ApiResponseDTO<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

@Controller('api/notices')
export class NoticesController {
    private readonly logger = new Logger(NoticesController.name);

    constructor(private readonly service: NoticesService) { }

    @Get()
    async getNoticeList(@Query() q: NoticeQueryDTO): Promise<ApiResponseDTO<any>> {
        this.logger.log(`getNoticeList page=${q.page} pageSize=${q.pageSize} keyword="${q.keyword ?? ''}"`);
        const list = await this.service.getNoticeList(q);
        return { success: true, data: list };
    }

    @Get(':notice_id')
    async getNoticeById(@Param('notice_id', ParseIntPipe) notice_id: number): Promise<ApiResponseDTO<any>> {
        this.logger.log(`getNoticeById id=${notice_id}`);
        const notice = await this.service.getNoticeById(notice_id);
        return { success: true, data: notice };
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async createNotice(
        @Req() req: AuthenticatedRequest,
        @Body() dto: CreateNoticeDTO,
    ): Promise<ApiResponseDTO<any>> {
        this.logger.log(`createNotice admin_user_id=${req.user.user_id}`);
        const notice = await this.service.createNotice( dto);
        return { success: true, data: notice, message: 'Created' };
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':notice_id')
    async updateNotice(
        @Param('notice_id', ParseIntPipe) notice_id: number,
        @Body() dto: UpdateNoticeDTO,
    ): Promise<ApiResponseDTO<any>> {
        this.logger.log(`updateNotice id=${notice_id}`);
        const notice = await this.service.updateNotice(notice_id, dto);
        return { success: true, data: notice, message: 'Updated' };
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':notice_id')
    async deleteNotice(
        @Param('notice_id', ParseIntPipe) notice_id: number,
    ): Promise<ApiResponseDTO<any>> {
        this.logger.log(`deleteNotice id=${notice_id}`);
        await this.service.deleteNotice(notice_id);
        return { success: true, message: 'Deleted' };
    }
}