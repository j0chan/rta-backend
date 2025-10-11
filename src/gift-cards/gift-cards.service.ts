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
    private readonly fileService: FileService, // ✅ S3 업로드 사용
  ) { }

  async getAllGiftCards(opts?: {
    category?: GiftCategoryCode;
    sort?: CatalogSort;
  }): Promise<GiftCard[]> {
    const qb = this.giftCardRepository
      .createQueryBuilder('g')
      .where('g.is_active = :active', { active: true });

    if (opts?.category) {
      // ENUM 매칭: 정상 경로라면 대문자 값만 저장되므로 아래 한 줄이면 충분
      qb.andWhere('g.category = :cat', { cat: opts.category });

      // 과거에 소문자/지저분한 값이 섞여 들어간 전적이 있다면:
      // qb.andWhere('UPPER(g.category) = :cat', { cat: opts.category });
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

  // ✅ S3 업로드 사용: 파일이 있으면 먼저 업로드하여 URL 확보 → GiftCard에 저장
  async createGiftCard(dto: CreateGiftCardDTO, image?: Express.Multer.File): Promise<GiftCard> {
    let imageUrl: string | undefined;

    if (image) {
      const files = await this.fileService.uploadImage([image], {} as any /* dummy */, UploadType.GIFT_CARD_IMAGE);
      // ↑ uploadImage는 targetEntity를 받아 File 레코드에 연관을 심을 수 있지만,
      //   GiftCard 관계를 아직 만들지 않았다면 dummy로 넘겨도 무방(연관 없이 파일 기록만 저장).
      //   만약 File 엔티티에 giftCard 관계가 있다면, 선저장 후 updateGiftCardImage를 권장.

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

    // (선택) File ↔ GiftCard 연계가 필요하면 여기서 updateGiftCardImage로 교체:
    // if (image) {
    //   const uploaded = await this.fileService.updateGiftCardImage(image, saved);
    //   saved.image_url = uploaded.url;
    //   await this.giftCardRepository.save(saved);
    // }

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
}