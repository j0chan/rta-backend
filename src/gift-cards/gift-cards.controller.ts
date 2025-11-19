import {
  Controller, Post, Body, Req, HttpCode, HttpStatus, Get, Param, ParseIntPipe,
  UsePipes, ValidationPipe, UseInterceptors, UploadedFile,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { JwtAuthGuard } from 'src/common/custom-decorators/jwt-auth.guard';
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard';
import { GiftCategoryCode } from './entities/gift-category-code.enum';
import { GiftCardGiftPurchaseDto, RegisterGiftCodeDto } from './dto/gift-card-gift-purchase.dto';

type CatalogSort = 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';

@Controller('api/gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) { }

  @Get('/catalog')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllGiftCards(
    @Query('category') category?: string,
    @Query('sort') sort?: CatalogSort,
  ): Promise<ApiResponseDTO<GiftCard[]>> {
    // 대소문자/공백 보정 + enum 유효성 체크
    const cat = category?.toString().trim().toUpperCase() as GiftCategoryCode | undefined;
    const isValidCat = cat && Object.values(GiftCategoryCode).includes(cat);
    const filterCat = isValidCat ? cat : undefined;

    const items = await this.giftCardsService.getAllGiftCards({
      category: filterCat,
      sort: sort ?? 'LATEST',
    });

    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card catalog retrieved', items);
  }

  @Get('/catalog/:id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  async getGiftCardById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDTO<GiftCard>> {
    const card = await this.giftCardsService.getGiftCardById(id);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card retrieved', card);
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard, RolesGuard)          // 인증 → 권한 가드 적용
  @Roles(UserRole.USER)
  async getMyGiftCards(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardPocket[]>> {
    // ✅ 방어: 로그인 안 됨
    if (!req.user) {
      throw new UnauthorizedException('Login required');
    }

    // ✅ user_id 안전 파싱 (payload에 id만 있는 경우도 커버)
    const rawId = (req.user as any).user_id ?? (req.user as any).id;
    const userId = Number(rawId);
    if (!Number.isFinite(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const pockets = await this.giftCardsService.getUserGiftCards(userId);
    return new ApiResponseDTO(true, HttpStatus.OK, 'User gift cards retrieved', pockets);
  }

  @Post('/use')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async useGiftCard(@Req() req: AuthenticatedRequest, @Body() dto: UpdateGiftCardDTO): Promise<ApiResponseDTO<null>> {
    const userId = req.user.user_id;
    await this.giftCardsService.useGiftCard(userId, dto);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card used successfully', null);
  }

  // ✅ 파일 업로드 + 생성
  @Post('/create')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image')) // 프론트 FormData 필드명 'image'
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async createGiftCard(
    @Req() _req: AuthenticatedRequest,
    @Body() createGiftCardDTO: CreateGiftCardDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ApiResponseDTO<GiftCard>> {
    const giftCard = await this.giftCardsService.createGiftCard(createGiftCardDTO, image);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'GiftCard created successfully', giftCard);
  }

  @Roles(UserRole.USER)
  @Post('/purchase')
  async purchaseGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PurchaseGiftCardDTO
  ): Promise<ApiResponseDTO<GiftCardPocket>> {
    const pocket = await this.giftCardsService.purchaseGiftCard(req.user.user_id, dto.gift_card_id);
    return new ApiResponseDTO(true, HttpStatus.CREATED, 'Gift card purchased successfully', pocket);
  }

  @Get('/usage-history')
  @Roles(UserRole.USER)
  async getUsageHistory(@Req() req: AuthenticatedRequest): Promise<ApiResponseDTO<GiftCardUsageHistory[]>> {
    const userId = req.user.user_id;
    const histories = await this.giftCardsService.getUsageHistory(userId);
    return new ApiResponseDTO(true, HttpStatus.OK, 'Gift card usage history retrieved', histories);
  }

  @Roles(UserRole.USER)
  @Post('/gift')
  async giftGiftCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GiftCardGiftPurchaseDto,
  ): Promise<ApiResponseDTO<{ gift_code: string; pocket: GiftCardPocket }>> {
    const result = await this.giftCardsService.giftGiftCard(
      req.user.user_id,
      dto.gift_card_id,
    );

    return new ApiResponseDTO(
      true,
      HttpStatus.CREATED,
      'Gift code generated successfully. Share this code with recipient.',
      result,
    );
  }

  // ===== 3. 코드 등록하기 =====
  @Roles(UserRole.USER)
  @Post('/register')
  async registerGiftCode(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RegisterGiftCodeDto,
  ): Promise<ApiResponseDTO<GiftCardPocket>> {
    const pocket = await this.giftCardsService.registerGiftCode(
      req.user.user_id,
      dto.gift_code
    );
    
    return new ApiResponseDTO(
      true,
      HttpStatus.OK,
      'Gift code registered successfully',
      pocket,
    );
  }
}