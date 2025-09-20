import { Controller, Get, Post, Body, UseGuards, Req, Logger, HttpStatus, } from '@nestjs/common';
import { CashService } from './cash.service';
import { CashTransaction } from './entities/cash-transaction.entity';
import { UserRole } from 'src/users/entities/user-role.enum';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/custom-decorators/jwt-auth.guard';
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto';
import { DepositCashDto } from './DTO/deposit-cash.dto';
import { WithdrawCashDto } from './DTO/withdraw-cash.dto';
import { PayWithCashDto } from './DTO/pay-with-cash.dto';

type BalancePayload = { total: number };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('api/cash')
export class CashController {
    private readonly logger = new Logger(CashController.name);

    constructor(private readonly cashService: CashService) { }

    // 캐쉬 잔액 조회
    @Get('/balance')
    async getMyCashBalance(
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponseDTO<BalancePayload>> {
        this.logger.log('getMyCashBalance START');

        const userId = req.user.user_id;
        const total = await this.cashService.getUserCashBalance(userId);

        this.logger.log('getMyCashBalance END');
        return new ApiResponseDTO<BalancePayload>(
            true,
            HttpStatus.OK,
            'Current Cash Balance Retrieved',
            { total },
        );
    }

    // 캐쉬 사용 이력 조회
    @Get('/transactions')
    async getMyCashTransactions(
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponseDTO<CashTransaction[]>> {
        this.logger.log('getMyCashTransactions START');
        const transactions = await this.cashService.getUserCashTransactions(
            req.user.user_id,
        );
        this.logger.log('getMyCashTransactions END');
        return new ApiResponseDTO<CashTransaction[]>(
            true,
            HttpStatus.OK,
            'Transaction History Retrieved',
            transactions,
        );
    }

    // 캐쉬 충전
    @Post('/deposit')
    async postDeposit(
        @Req() req: AuthenticatedRequest,
        @Body() dto: DepositCashDto,
    ): Promise<ApiResponseDTO<{ balance: number; transaction: CashTransaction }>> {
        this.logger.log(
            `deposit START user=${req.user.user_id}, amount=${dto.amount}`,
        );
        const data = await this.cashService.deposit(req.user.user_id, dto);
        this.logger.log('deposit END');
        return new ApiResponseDTO(
            true,
            HttpStatus.OK,
            '충전 완료',
            data,
        );
    }

    // 캐쉬 인출
    @Post('/withdraw')
    async postWithdraw(
        @Req() req: AuthenticatedRequest,
        @Body() dto: WithdrawCashDto,
    ): Promise<ApiResponseDTO<{ balance: number; transaction: CashTransaction }>> {
        this.logger.log(
            `withdraw START user=${req.user.user_id}, amount=${dto.amount}`,
        );
        const data = await this.cashService.withdraw(req.user.user_id, dto);
        this.logger.log('withdraw END');
        return new ApiResponseDTO(
            true,
            HttpStatus.OK,
            '인출 완료',
            data,
        );
    }

    // 캐쉬 사용
    @Post('/pay')
    async postPay(
        @Req() req: AuthenticatedRequest,
        @Body() dto: PayWithCashDto,
    ): Promise<
        ApiResponseDTO<{
            cash: { balance: number; transaction: CashTransaction };
            point: { balance: number; earned: number; transaction: any };
        }>
    > {
        this.logger.log(
            `pay START user=${req.user.user_id}, store=${dto.store_id}, amount=${dto.amount}`,
        );
        const data = await this.cashService.pay(req.user.user_id, dto);
        this.logger.log('pay END');
        return new ApiResponseDTO(
            true,
            HttpStatus.OK,
            '결제 완료',
            data,
        );
    }
}