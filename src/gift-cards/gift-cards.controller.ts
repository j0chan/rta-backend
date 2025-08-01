import { Controller, Post, Body, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user-role.enum';
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto';
import { UpdateGiftCardDTO } from './dto/update-gift-card.dto';
import { CreateGiftCardDTO } from './dto/create-gift-card.dto';
import { GiftCard } from './entities/gift-card.entity';
import { PurchaseGiftCardDTO } from './dto/purchase-gift-card.dto';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';

@Controller('api/gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) { }

  // 상품권 종류 조회 로직
  @Get('/catalog')
  @Roles(UserRole.USER) // 혹은 인증만 필요할 경우 @Roles 생략 가능
  async getAllGiftCards(): Promise<ApiResponseDTO<GiftCard[]>> {

    const giftCards = await this.giftCardsService.getAllGiftCards();

    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card catalog retrieved', giftCards);
  }

  // 내 상품권 조회 로직
  @Get('/my')
  @Roles(UserRole.USER)
  async getMyGiftCards(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardPocket[]>> {

    const userId = req.user.user_id;
    const pockets = await this.giftCardsService.getUserGiftCards(userId);

    return new ApiResponseDTO(true, HttpStatus.OK, 'User gift cards retrieved', pockets);
  }

  // 상품권 사용 로직
  @Post('/use')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async useGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateGiftCardDTO,
  ): Promise<ApiResponseDTO<null>> {
    const userId = req.user.user_id;

    await this.giftCardsService.useGiftCard(userId, dto);

    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card used successfully', null);
  }

  // 상품권 생성 로직
  @Post('/create')
  @Roles(UserRole.ADMIN)
  async createGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() createGiftCardDTO: CreateGiftCardDTO
  ): Promise<ApiResponseDTO<GiftCard>> {
    const giftCard = await this.giftCardsService.createGiftCard(createGiftCardDTO);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'GiftCard created successfully', giftCard);
  }

  // 상품권 구매 로직
  @Roles(UserRole.USER)
  @Post('/purchase')
  async purchaseGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PurchaseGiftCardDTO
  ): Promise<ApiResponseDTO<GiftCardPocket>> {
    const pocket = await this.giftCardsService.purchaseGiftCard(req.user.user_id, dto.gift_card_id);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'Gift card purchased successfully', pocket);
  }

  // 상품권 사용 내역 조회 로직
  @Get('/usage-history')
  @Roles(UserRole.USER)
  async getUsageHistory(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardUsageHistory[]>> {
    const userId = req.user.user_id;
    const histories = await this.giftCardsService.getUsageHistory(userId);

    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card usage history retrieved', histories);
  }

}