import { GiftCardType } from '../entities/gift-card-type.enum'
import { GiftCardCategory } from '../entities/gift-card-category.enum'

export class GiftCardViewDTO {
  gift_card_id: number;
  name: string;
  type: GiftCardType;
  amount: number;
  category: GiftCardCategory;
  image_url?: string | null;
  created_at: Date;
}

export class GiftCardPocketViewDTO {
  pocket_id: number;
  is_used: boolean;
  remaining_amount: number;
  giftCard: GiftCardViewDTO; // 유저 정보 없음
}

export class GiftCardUsageHistoryViewDTO {
  usage_id: number;
  pocket_id: number;
  gift_card_id: number;
  store: string;
  amount_used?: number | null;
  used_at: Date;
}