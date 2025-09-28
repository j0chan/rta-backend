import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDTO } from './dto/create-notice.dto';
import { UpdateNoticeDTO } from './dto/update-notice.dto';
import { NoticeQueryDTO } from './dto/notice-query.dto';

@Injectable()
export class NoticesService {
    private readonly logger = new Logger(NoticesService.name);

    constructor(
        @InjectRepository(Notice)
        private readonly noticeRepo: Repository<Notice>,
    ) { }

    async createNotice(dto: CreateNoticeDTO): Promise<Notice> {
        const notice = this.noticeRepo.create({ ...dto });
        return await this.noticeRepo.save(notice);
    }

    async updateNotice(notice_id: number, dto: UpdateNoticeDTO): Promise<Notice> {
        const notice = await this.noticeRepo.findOne({ where: { notice_id } });
        if (!notice) throw new NotFoundException('Notice not found');

        Object.assign(notice, dto);
        await this.noticeRepo.save(notice);
        return notice;
    }

    async deleteNotice(notice_id: number): Promise<void> {
        const res = await this.noticeRepo.delete({ notice_id });
        if (!res.affected) throw new NotFoundException('Notice not found');
    }

    async getNoticeById(notice_id: number): Promise<Notice> {
        const notice = await this.noticeRepo.findOne({ where: { notice_id } });
        if (!notice) throw new NotFoundException('Notice not found');
        return notice;
    }

    async getNoticeList(q: NoticeQueryDTO): Promise<{
        items: Notice[];
        total: number;
        page: number;
        pageSize: number;
    }> {
        const { keyword, page = 1, pageSize = 10, isPinnedOnly, excludePinned } = q;

        const where: FindOptionsWhere<Notice>[] = [];
        const base: FindOptionsWhere<Notice> = {};
        if (keyword) {
            where.push({ ...base, title: ILike(`%${keyword}%`) });
            where.push({ ...base, content: ILike(`%${keyword}%`) });
        } else {
            where.push(base);
        }

        if (isPinnedOnly) {
            where.forEach(w => (w.is_pinned = true));
        }
        if (excludePinned) {
            where.forEach(w => (w.is_pinned = false));
        }

        const [items, total] = await this.noticeRepo.findAndCount({
            where,
            order: isPinnedOnly ? { created_at: 'DESC' } : { created_at: 'DESC' },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        return { items, total, page, pageSize };
    }
}