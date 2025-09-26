import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftCardPocket } from './entities/gift-card-pocket.entity';
import { Repository } from 'typeorm';
import { GiftCardType } from './entities/gift-card-type.enum';
import { GiftCardUsageHistory } from './entities/gift-card-usage-history.entity';
import { UpdateGiftCardDTO } from './dto/update-gift-card.dto';
import { CreateGiftCardDTO } from './dto/create-gift-card.dto';
import { GiftCard } from './entities/gift-card.entity';
import { UserPoint } from 'src/users/entities/user-point.entity';
import { User } from 'src/users/entities/user.entity';
import { PointTransaction, PointTransactionType } from 'src/points/entities/point-transaction.entity';

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
    private userRepository: Repository<User>
  ) { }

  // 상품권 종류 조회 로직
  async getAllGiftCards(): Promise<GiftCard[]> {
    return this.giftCardRepository.find({
      where: { is_active: true },
    });
  }

  // 상품권 상세 조회 로직
  async getGiftCardById(id: number): Promise<GiftCard> {
    const card = await this.giftCardRepository.findOne({
      where: { gift_card_id: id },
    });
    if (!card) throw new NotFoundException('Gift card not found');
    return card;
  }

  // 내 상품권 조회 로직
  async getUserGiftCards(user_id: number): Promise<GiftCardPocket[]> {
    return this.giftCardPocketRepository.find({
      where: { user: { user_id } },
      relations: ['giftCard'],
    });
  }

  // 상품권 사용 기록 조회 로직
  async getUsageHistory(userId: number): Promise<GiftCardUsageHistory[]> {
    const histories = await this.usageHistoryRepository.find({
      where: {
        pocket: {
          user: {
            user_id: userId,
          },
        },
      },
      relations: ['pocket', 'pocket.giftCard'],
      order: { used_at: 'DESC' },
    });

    return histories;
  }

  // 상품권 사용 기록 생성
  async recordUsageHistory(
    pocket: GiftCardPocket,
    store: string,
    amount?: number
  ): Promise<void> {
    const usage = this.usageHistoryRepository.create({
      pocket,
      amount_used: amount,
      store: store,
    });

    await this.usageHistoryRepository.save(usage);
  }


  // 상품권 사용 로직 - 상품권 사용 시 자동으로 사용 기록 생성
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
      if (pocket.is_used) {
        throw new BadRequestException('This gift card is already used.');
      }

      pocket.is_used = true;
      await this.giftCardPocketRepository.save(pocket);
      await this.recordUsageHistory(pocket, store, undefined);
    }

    if (pocket.giftCard.type === GiftCardType.AMOUNT) {
      if (!amount || amount <= 0) {
        throw new BadRequestException('Amount must be provided and positive.');
      }

      if (pocket.remaining_amount < amount) {
        throw new BadRequestException('Not enough balance.');
      }

      pocket.remaining_amount -= amount;
      if (pocket.remaining_amount === 0) {
        pocket.is_used = true;
      }

      await this.giftCardPocketRepository.save(pocket);
      await this.recordUsageHistory(pocket, store, amount);
    }
  }

  // 상품권 생성 로직
  async createGiftCard(dto: CreateGiftCardDTO): Promise<GiftCard> {
    const giftCard = this.giftCardRepository.create({
      name: dto.name,
      type: dto.type,
      amount: dto.amount,
      is_active: true,
    });

    return await this.giftCardRepository.save(giftCard);
  }

  // 상품권 구매 로직
  async purchaseGiftCard(user_id: number, gift_card_id: number): Promise<GiftCardPocket> {
    const user = await this.userRepository.findOne({ where: { user_id }, relations: ['point'] });
    if (!user) throw new NotFoundException('User not found');

    const giftCard = await this.giftCardRepository.findOne({ where: { gift_card_id, is_active: true } });
    if (!giftCard) throw new NotFoundException('Gift card not found or inactive');

    // 유저 포인트 잔액 확인
    const userPoint = await this.userPointRepository.findOne({ where: { user: { user_id } } });
    if (!userPoint || userPoint.balance < giftCard.amount) {
      throw new BadRequestException('Not enough points to purchase this gift card');
    }

    // 포인트 차감
    userPoint.balance -= giftCard.amount;

    // 포인트 사용 이력 생성
    const transaction = this.pointTransactionRepository.create({
      userPoint,
      type: PointTransactionType.USE,
      amount: giftCard.amount,
      reason: giftCard.name,
    });
    await this.userPointRepository.save(userPoint);
    await this.pointTransactionRepository.save(transaction);

    // GiftCardPocket 생성
    const pocket = this.giftCardPocketRepository.create({
      user,
      giftCard,
      remaining_amount: giftCard.type === GiftCardType.AMOUNT ? giftCard.amount : 0,
      is_used: false,
    });
    return this.giftCardPocketRepository.save(pocket);
  }

}