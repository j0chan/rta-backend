import { Controller, Post, Body, Req, HttpCode, HttpStatus, Get, Param, Query } from '@nestjs/common'
import { GiftCardsService } from './gift-cards.service'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { UserRole } from 'src/users/entities/user-role.enum'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { UpdateGiftCardDTO } from './dto/update-gift-card.dto'
import { CreateGiftCardDTO } from './dto/create-gift-card.dto'
import { PurchaseGiftCardDTO } from './dto/purchase-gift-card.dto'
import { GiftCardPocketViewDTO, GiftCardUsageHistoryViewDTO, GiftCardViewDTO } from './dto/gift-card-view.dto'
import { GiftCardCategory } from './entities/gift-card-category.enum'

@Controller('api/gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) { }

  // 카탈로그: 목록 (최신순), 카테고리 필터
  @Get('/catalog')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async getCatalog(
    @Query('category') category?: GiftCardCategory,
  ): Promise<ApiResponseDTO<GiftCardViewDTO[]>> {
    const data = await this.giftCardsService.getCatalog(category);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card catalog retrieved', data);
  }

  // 카탈로그: 단건
  @Get('/catalog/:id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async getCatalogItem(@Param('id') id: string): Promise<ApiResponseDTO<GiftCardViewDTO>> {
    const data = await this.giftCardsService.getCatalogItem(Number(id));
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card detail retrieved', data);
  }

  // 내 상품권(포켓)
  @Get('/my')
  @Roles(UserRole.USER)
  async getMyGiftCards(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardPocketViewDTO[]>> {
    const userId = req.user.user_id;
    const pockets = await this.giftCardsService.getUserGiftCards(userId);
    return new ApiResponseDTO(true, HttpStatus.OK, 'User gift cards retrieved', pockets);
  }

  // 상품권 사용
  @Post('/use')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async useGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateGiftCardDTO,
  ): Promise<ApiResponseDTO<null>> {
    await this.giftCardsService.useGiftCard(req.user.user_id, dto);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card used successfully', null);
  }

  // 상품권 생성(관리자)
  @Post('/create')
  @Roles(UserRole.ADMIN)
  async createGiftCard(
    @Body() createGiftCardDTO: CreateGiftCardDTO,
  ): Promise<ApiResponseDTO<GiftCardViewDTO>> {
    const giftCard = await this.giftCardsService.createGiftCard(createGiftCardDTO);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'GiftCard created successfully', giftCard);
  }

  // 상품권 구매 → 포인트 트랜잭션 기록 + 포켓 발급
  @Roles(UserRole.USER)
  @Post('/purchase')
  async purchaseGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PurchaseGiftCardDTO,
  ): Promise<ApiResponseDTO<GiftCardPocketViewDTO>> {
    const pocket = await this.giftCardsService.purchaseGiftCard(req.user.user_id, dto.gift_card_id);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'Gift card purchased successfully', pocket);
  }

  // 사용 내역
  @Get('/usage-history')
  @Roles(UserRole.USER)
  async getUsageHistory(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardUsageHistoryViewDTO[]>> {
    const histories = await this.giftCardsService.getUsageHistory(req.user.user_id);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card usage history retrieved', histories);
  }
}