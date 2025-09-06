import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GiftCardPocket } from './entities/gift-card-pocket.entity'
import { Repository } from 'typeorm'
import { GiftCardType } from './entities/gift-card-type.enum'
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity'
import { UpdateGiftCardDTO } from './dto/update-gift-card.dto'
import { CreateGiftCardDTO } from './dto/create-gift-card.dto'
import { GiftCard } from './entities/gift-card.entity'
import { User } from 'src/users/entities/user.entity'
import { GiftCardCategory } from './entities/gift-card-category.enum'
import { GiftCardPocketViewDTO, GiftCardUsageHistoryViewDTO, GiftCardViewDTO, } from './dto/gift-card-view.dto'
import { PointsService } from 'src/points/points.service'

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectRepository(GiftCardPocket)
    private giftCardPocketRepository: Repository<GiftCardPocket>,

    @InjectRepository(GiftCardUsageHistory)
    private usageHistoryRepository: Repository<GiftCardUsageHistory>,

    @InjectRepository(GiftCard)
    private giftCardRepository: Repository<GiftCard>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly pointsService: PointsService, // 포인트 트랜잭션 기록에 사용
  ) { }

  private toGiftCardView(g: GiftCard): GiftCardViewDTO {
    return {
      gift_card_id: g.gift_card_id,
      name: g.name,
      type: g.type,
      amount: g.amount,
      category: g.category,
      image_url: g.image_url ?? null,
      created_at: g.created_at,
    };
  }

  private toPocketView(p: GiftCardPocket): GiftCardPocketViewDTO {
    return {
      pocket_id: p.pocket_id,
      is_used: p.is_used,
      remaining_amount: p.remaining_amount ?? 0,
      giftCard: this.toGiftCardView(p.giftCard),
    };
  }

  private toUsageView(u: GiftCardUsageHistory): GiftCardUsageHistoryViewDTO {
    return {
      usage_id: u.usage_id,
      pocket_id: u.pocket.pocket_id,
      gift_card_id: u.pocket.giftCard.gift_card_id,
      store: u.store!,
      amount_used: u.amount_used ?? null,
      used_at: u.used_at,
    };
  }

  async getCatalog(category?: GiftCardCategory): Promise<GiftCardViewDTO[]> {
    const where = category ? { is_active: true, category } : { is_active: true };
    const rows = await this.giftCardRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
    return rows.map(this.toGiftCardView.bind(this));
  }

  async getCatalogItem(id: number): Promise<GiftCardViewDTO> {
    const row = await this.giftCardRepository.findOne({ where: { gift_card_id: id, is_active: true } });
    if (!row) throw new NotFoundException('Gift card not found');
    return this.toGiftCardView(row);
  }

  async getUserGiftCards(user_id: number): Promise<GiftCardPocketViewDTO[]> {
    const pockets = await this.giftCardPocketRepository.find({
      where: { user: { user_id } },
      relations: ['giftCard'],
      order: { pocket_id: 'DESC' },
    });
    return pockets.map(this.toPocketView.bind(this));
  }

  async getUsageHistory(userId: number): Promise<GiftCardUsageHistoryViewDTO[]> {
    const histories = await this.usageHistoryRepository.find({
      where: {
        pocket: { user: { user_id: userId } },
      },
      relations: ['pocket', 'pocket.giftCard'],
      order: { used_at: 'DESC' },
    });
    return histories.map(this.toUsageView.bind(this));
  }

  async recordUsageHistory(
    pocket: GiftCardPocket,
    store: string,
    amount?: number,
  ): Promise<void> {
    const usage = this.usageHistoryRepository.create({
      pocket,
      amount_used: amount,
      store,
    });
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

    if (!store?.trim()) {
      throw new BadRequestException('Store is required.');
    }

    if (pocket.giftCard.type === GiftCardType.EXCHANGE) {
      if (pocket.is_used) throw new BadRequestException('This gift card is already used.');
      pocket.is_used = true;
      await this.giftCardPocketRepository.save(pocket);
      await this.recordUsageHistory(pocket, store);
      return;
    }

    // AMOUNT
    if (!amount || amount <= 0) throw new BadRequestException('Amount must be provided and positive.');
    if (pocket.remaining_amount < amount) throw new BadRequestException('Not enough balance.');

    pocket.remaining_amount -= amount;
    if (pocket.remaining_amount === 0) pocket.is_used = true;

    await this.giftCardPocketRepository.save(pocket);
    await this.recordUsageHistory(pocket, store, amount);
  }

  async createGiftCard(dto: CreateGiftCardDTO): Promise<GiftCardViewDTO> {
    const giftCard = this.giftCardRepository.create({
      name: dto.name,
      type: dto.type,
      amount: dto.amount,
      category: dto.category,
      image_url: dto.image_url,
      is_active: true,
    });
    const saved = await this.giftCardRepository.save(giftCard);
    return this.toGiftCardView(saved);
  }

  async purchaseGiftCard(user_id: number, gift_card_id: number): Promise<GiftCardPocketViewDTO> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException('User not found');

    const giftCard = await this.giftCardRepository.findOne({
      where: { gift_card_id, is_active: true },
    });
    if (!giftCard) throw new NotFoundException('Gift card not found or inactive');

    // 포인트 서비스로 "사용" 처리(트랜잭션 기록 + 잔액차감)
    await this.pointsService.use(user_id, giftCard.amount, `상품권 구매 - ${giftCard.name}`);

    // Pocket 발급 (유저 개인정보는 응답에서 제외)
    const pocket = this.giftCardPocketRepository.create({
      user,
      giftCard,
      remaining_amount: giftCard.type === GiftCardType.AMOUNT ? giftCard.amount : 0,
      is_used: false,
    });
    const saved = await this.giftCardPocketRepository.save(pocket);

    // 다시 읽어 DTO 변환용 관계 채우기
    const withCard = await this.giftCardPocketRepository.findOne({
      where: { pocket_id: saved.pocket_id },
      relations: ['giftCard'],
    });

    return this.toPocketView(withCard!);
  }
}