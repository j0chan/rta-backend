import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionPlacement } from './entities/promotion.entity';
import { CreatePromotionDTO } from './dto/create-promotion.dto';
import { UploadType } from 'src/file/entities/upload-type.enum';
import { FileService } from 'src/file/file.service';

@Injectable()
export class PromotionService {
    constructor(
        @InjectRepository(Promotion)
        private readonly promoRepo: Repository<Promotion>,
        private readonly fileService: FileService,
    ) { }

    async listByPlacement(placement: PromotionPlacement): Promise<Promotion[]> {
        return this.promoRepo.find({
            where: { placement },
            order: { created_at: 'DESC' },
        });
    }

    async create(dto: CreatePromotionDTO, image?: Express.Multer.File): Promise<Promotion> {
        let imageUrl: string | undefined;

        if (image) {
            const uploaded = await this.fileService.uploadImage([image], {} as any, UploadType.PROMOTION_IMAGE);
            imageUrl = uploaded[0]?.url;
        } else if (dto.image_url) {
            imageUrl = dto.image_url.trim();
        }

        const entity = this.promoRepo.create({
            placement: dto.placement,
            image_url: imageUrl ?? undefined,
        });
        return this.promoRepo.save(entity);
    }

    async getOne(id: number): Promise<Promotion> {
        const found = await this.promoRepo.findOne({ where: { promotion_id: id } });
        if (!found) throw new NotFoundException('Promotion not found');
        return found;
    }

    async remove(id: number): Promise<void> {
        const found = await this.promoRepo.findOne({ where: { promotion_id: id } });
        if (!found) throw new NotFoundException('Promotion not found');

        // 1) S3 오브젝트 삭제 (URL만 저장한 구조 -> deleteByUrl 사용)
        await this.fileService.deleteByUrl(found.image_url);

        // 2) DB 레코드 삭제
        await this.promoRepo.delete({ promotion_id: id });
    }
}