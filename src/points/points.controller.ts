import { Controller, Get, Post, Req, Body, HttpStatus, Logger } from '@nestjs/common';
import { PointsService } from './points.service';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user-role.enum';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { EarnPointDTO } from './DTO/update-earnpoint.dto';
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto';
import { PointTransaction } from './entities/point-transaction.entity';
import { UsePointDTO } from './DTO/update-usepoint.dot';

@Controller('api/points')
export class PointsController {
    private readonly logger = new Logger(PointsController.name);

    constructor(private readonly pointsService: PointsService) { }

    // CREATE - 포인트 적립
    @Post('/earn')
    @Roles(UserRole.USER)
    async earnPoint(
        @Req() req: AuthenticatedRequest,
        @Body() earnPointDTO: EarnPointDTO
    ): Promise<ApiResponseDTO<{ earned: number }>> {
        this.logger.log(`earnPoint START`);

        const userId = req.user.user_id;
        const earned = await this.pointsService.earn(userId, earnPointDTO.amount, earnPointDTO.reason);

        this.logger.log(`earnPoint END`);
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Point Earned Successfully', { earned });
    }

    // 포인트 사용
    @Post('/use')
    @Roles(UserRole.USER)
    async usePoint(
        @Req() req: AuthenticatedRequest,
        @Body() usePointDTO: UsePointDTO
    ): Promise<ApiResponseDTO<{ used: number }>> {
        this.logger.log(`usePoint START`);

        const user_id = req.user.user_id;
        const used = await this.pointsService.use(user_id, usePointDTO.amount, usePointDTO.reason);

        this.logger.log(`usePoint END`);
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Point Used Successfully', { used });
    }

    // READ - 내 포인트 보유량 조회
    @Get('/balance')
    @Roles(UserRole.USER)
    async getMyPointBalance(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<{ total: number }>> {
        this.logger.log(`getMyPointBalance START`);

        const userId = req.user.user_id;
        const total = await this.pointsService.getUserPointTotal(userId);

        this.logger.log(`getMyPointBalance END`);
        return new ApiResponseDTO(true, HttpStatus.OK, 'Current Point Balance Retrieved', { total });
    }

    // READ - 내 포인트 이력 조회
    @Get('/transactions')
    @Roles(UserRole.USER)
    async getMyPointTransactions(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<PointTransaction[]>> {
        this.logger.log(`getMyPointTransactions START`);

        const userId = req.user.user_id;
        const transactions = await this.pointsService.getUserPointTransactions(userId);

        this.logger.log(`getMyPointTransactions END`);
        return new ApiResponseDTO(true, HttpStatus.OK, 'Transaction History Retrieved', transactions);
    }
}