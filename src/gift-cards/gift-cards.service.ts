import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';
import { UpdateGiftCardDTO } from './dto/update-gift-card.dto';
import { CreateGiftCardDTO } from './dto/create-gift-card.dto';
import { GiftCard } from './entities/gift-card.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { User } from 'src/users/entities/user.entity';
import { PointTransaction, PointTransactionType } from 'src/points/entities/point-transaction.entity';
import { GiftCardType } from './entities/gift-card-type.enum';
import { FileService } from 'src/file/file.service';
import { UploadType } from 'src/file/entities/upload-type.enum';
import { GiftCategoryCode } from './entities/gift-category-code.enum';

type CatalogSort = 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectRepository(GiftCardPocket)
    private giftCardPocketRepository: Repository<GiftCardPocket>,
    @InjectRepository(GiftCardUsageHistory)
    private usageHistoryRepository: Repository<GiftCardUsageHistory>,
    @InjectRepository(GiftCard)
    private giftCardRepository: Repository<GiftCard>,
    @InjectRepository(UserPoint)
    private userPointRepository: Repository<UserPoint>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly fileService: FileService,
  ) { }

  async getAllGiftCards(opts?: {
    category?: GiftCategoryCode;
    sort?: CatalogSort;
  }): Promise<GiftCard[]> {
    const qb = this.giftCardRepository
      .createQueryBuilder('g')
      .where('g.is_active = :active', { active: true });

    if (opts?.category) {
      qb.andWhere('g.category = :cat', { cat: opts.category });
    }

    switch (opts?.sort) {
      case 'PRICE_ASC':
        qb.orderBy('g.amount', 'ASC');
        break;
      case 'PRICE_DESC':
        qb.orderBy('g.amount', 'DESC');
        break;
      case 'POPULAR':
        // 별도 지표 없으면 임시로 최신순과 동일
        qb.orderBy('g.created_at', 'DESC');
        break;
      case 'LATEST':
      default:
        qb.orderBy('g.created_at', 'DESC');
        break;
    }

    return qb.getMany();
  }

  async getGiftCardById(id: number): Promise<GiftCard> {
    const card = await this.giftCardRepository.findOne({ where: { gift_card_id: id } });
    if (!card) throw new NotFoundException('Gift card not found');
    return card;
  }

  async getUserGiftCards(user_id: number): Promise<GiftCardPocket[]> {
    return this.giftCardPocketRepository.find({
      where: { user: { user_id } },
      relations: ['giftCard'],
    });
  }

  async getUsageHistory(userId: number): Promise<GiftCardUsageHistory[]> {
    const histories = await this.usageHistoryRepository.find({
      where: { pocket: { user: { user_id: userId } } },
      relations: ['pocket', 'pocket.giftCard'],
      order: { used_at: 'DESC' },
    });
    return histories;
  }

  async recordUsageHistory(pocket: GiftCardPocket, store: string, amount?: number): Promise<void> {
    const usage = this.usageHistoryRepository.create({ pocket, amount_used: amount, store });
    await this.usageHistoryRepository.save(usage);
  }

  async useGiftCard(userId: number, dto: UpdateGiftCardDTO): Promise<void> {
    const { pocket_id, amount, store } = dto;

    const pocket = await this.giftCardPocketRepository.findOne({
      where: { pocket_id },
      relations: ['user', 'giftCard'],
    });
    if (!pocket || pocket.user.user_id !== userId) {
      throw new NotFoundException('GiftCard not found or not owned by user');
    }

    if (pocket.giftCard.type === GiftCardType.EXCHANGE) {
      if (pocket.is_used) throw new BadRequestException('This gift card is already used.');
      pocket.is_used = true;
      await this.giftCardPocketRepository.save(pocket);
      await this.recordUsageHistory(pocket, store, undefined);
    }

    if (pocket.giftCard.type === GiftCardType.AMOUNT) {
      if (!amount || amount <= 0) throw new BadRequestException('Amount must be provided and positive.');
      if (pocket.remaining_amount < amount) throw new BadRequestException('Not enough balance.');
      pocket.remaining_amount -= amount;
      if (pocket.remaining_amount === 0) pocket.is_used = true;
      await this.giftCardPocketRepository.save(pocket);
      await this.recordUsageHistory(pocket, store, amount);
    }
  }

  async createGiftCard(dto: CreateGiftCardDTO, image?: Express.Multer.File): Promise<GiftCard> {
    let imageUrl: string | undefined;

    if (image) {
      const files = await this.fileService.uploadImage([image], {} as any /* dummy */, UploadType.GIFT_CARD_IMAGE);
      imageUrl = files[0]?.url;
    } else if (dto.image_url) {
      imageUrl = dto.image_url.trim();
    }

    const giftCard = this.giftCardRepository.create({
      name: dto.name.trim(),
      type: dto.type,
      amount: Number(dto.amount),
      category: dto.category,
      image_url: imageUrl ?? undefined,
      is_active: dto.is_active ?? true,
    });

    const saved = await this.giftCardRepository.save(giftCard);

    return saved;
  }

  async purchaseGiftCard(user_id: number, gift_card_id: number): Promise<GiftCardPocket> {
    const user = await this.userRepository.findOne({ where: { user_id }, relations: ['point'] });
    if (!user) throw new NotFoundException('User not found');

    const giftCard = await this.giftCardRepository.findOne({ where: { gift_card_id, is_active: true } });
    if (!giftCard) throw new NotFoundException('Gift card not found or inactive');

    const userPoint = await this.userPointRepository.findOne({ where: { user: { user_id } } });
    if (!userPoint || userPoint.balance < giftCard.amount) {
      throw new BadRequestException('Not enough points to purchase this gift card');
    }

    userPoint.balance -= giftCard.amount;

    const transaction = this.pointTransactionRepository.create({
      userPoint,
      type: PointTransactionType.USE,
      amount: giftCard.amount,
      reason: giftCard.name,
    });
    await this.userPointRepository.save(userPoint);
    await this.pointTransactionRepository.save(transaction);

    const pocket = this.giftCardPocketRepository.create({
      user,
      giftCard,
      remaining_amount: giftCard.type === GiftCardType.AMOUNT ? giftCard.amount : 0,
      is_used: false,
    });
    return this.giftCardPocketRepository.save(pocket);
  }

  async giftGiftCard(
    payer_user_id: number,
    gift_card_id: number,
  ): Promise<{ gift_code: string; pocket: GiftCardPocket }> {

    // 1) 선물 보내는 사람 조회 (현재 로그인한 사용자)
    const sender = await this.userRepository.findOne({
      where: { user_id: payer_user_id },
      relations: ['point'],
    });
    if (!sender) {
      throw new NotFoundException('User not found');
    }

    // 2) 상품권 조회 (활성 여부 포함)
    const giftCard = await this.giftCardRepository.findOne({
      where: { gift_card_id, is_active: true },
    });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found or inactive');
    }

    // 3) 선물 보내는 사람의 포인트 조회 및 잔액 체크
    const senderPoint = await this.userPointRepository.findOne({
      where: { user: { user_id: payer_user_id } },
    });
    if (!senderPoint || senderPoint.balance < giftCard.amount) {
      throw new BadRequestException('Not enough points to gift this gift card');
    }

    // 4) 포인트 차감
    senderPoint.balance -= giftCard.amount;

    // 5) 포인트 거래 내역 생성 (선물 구매)
    const transaction = this.pointTransactionRepository.create({
      userPoint: senderPoint,
      type: PointTransactionType.USE,
      amount: giftCard.amount,
      reason: `${giftCard.name} (gift code)`,
    });

    // 6) 포인트 저장
    await this.userPointRepository.save(senderPoint);
    await this.pointTransactionRepository.save(transaction);

    // 7) 고유 코드 생성 (중복 방지)
    const giftCode = await this.generateUniqueGiftCode();

    // 8) PENDING 상태의 pocket 생성
    const pocket = this.giftCardPocketRepository.create({
      payer: sender,                // 선물 보내는 사람 (현재 로그인한 사용자)
      giftCard,
      gift_code: giftCode,
      code_status: 'PENDING',
      remaining_amount: giftCard.type === GiftCardType.AMOUNT ? giftCard.amount : 0,
      is_used: false,
      code_created_at: new Date(),
      code_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const savedPocket = await this.giftCardPocketRepository.save(pocket);

    // 9) 생성된 코드와 pocket 정보 반환
    return {
      gift_code: giftCode,
      pocket: savedPocket,
    };
  }

  async registerGiftCode(
    user_id: number,
    gift_code: string,
  ): Promise<GiftCardPocket> {

    // 1) 코드로 pocket 조회
    const pocket = await this.giftCardPocketRepository.findOne({
      where: { gift_code },
      relations: ['giftCard', 'payer'],
    });

    // 코드가 존재하지 않음
    if (!pocket) {
      throw new NotFoundException('Invalid gift code');
    }

    // 2) 코드 상태 확인 - 이미 등록된 코드
    if (pocket.code_status === 'REGISTERED') {
      throw new BadRequestException('This code has already been registered');
    }

    // 3) 코드 상태 확인 - PENDING이 아닌 경우 (예외 상황)
    if (pocket.code_status !== 'PENDING') {
      throw new BadRequestException('Invalid code status');
    }

    // 4) 만료 확인
    if (pocket.code_expires_at && new Date() > pocket.code_expires_at) {
      throw new BadRequestException('This code has expired');
    }

    // 6) 사용자 조회
    const user = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 7) pocket에 사용자 정보 업데이트
    pocket.user = user;
    pocket.code_status = 'REGISTERED';
    pocket.code_registered_at = new Date();

    return this.giftCardPocketRepository.save(pocket);
  }

  private async generateUniqueGiftCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    // 중복이 없을 때까지 반복
    do {
      code = this.generateGiftCode();
      const existing = await this.giftCardPocketRepository.findOne({
        where: { gift_code: code },
      });
      exists = !!existing;
    } while (exists);

    return code;
  }

  // ===== 헬퍼 함수: 코드 생성 로직 =====
  private generateGiftCode(): string {
    // GIFT-XXXXXXXXXXXX 형식 (총 16자)
    const prefix = 'GIFT';
    const timestamp = Date.now().toString(36).toUpperCase();  // 36진수로 변환
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${prefix}-${timestamp}${random}`;
  }
}