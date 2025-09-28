import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDTO } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectRepository(Promotion)
        private readonly repo: Repository<Promotion>,
    ) { }

    async create(dto: CreatePromotionDTO): Promise<Promotion> {
        const p = this.repo.create(dto);
        return this.repo.save(p);
    }

    async listAll(): Promise<Promotion[]> {
        return this.repo.find({ order: { created_at: 'DESC' } });
    }

    async listActiveByPlacement(placement: 'MAIN' | 'GIFT_CARD'): Promise<Promotion[]> {
        // “비활성화 없음, 삭제만” 이므로 단순히 최신순 정렬
        return this.repo.find({
            where: { placement },
            order: { created_at: 'DESC' },
        });
    }

    async delete(promotion_id: number): Promise<void> {
        const res = await this.repo.delete(promotion_id);
        if (!res.affected) throw new NotFoundException('Promotion not found');
    }
}