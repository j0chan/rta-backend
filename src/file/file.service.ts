import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadType } from './entities/upload-type.enum';
import { Review } from 'src/reviews/entities/review.entity';
import { v4 as uuidv4 } from 'uuid';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { GiftCard } from 'src/gift-cards/entities/gift-card.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';

dotenv.config();

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    private s3Client: S3Client;
    private bucketName: string;
    private domain?: string; // 예: https://team-201.s3.ap-northeast-2.amazonaws.com

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
    ) {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        this.bucketName = String(process.env.AWS_S3_BUCKET);
        this.domain = process.env.AWS_DOMAIN;

        if (!accessKeyId || !secretAccessKey || !region || !this.bucketName) {
            throw new Error('Missing AWS S3 environment variables');
        }

        this.s3Client = new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey },
        });
    }

    /**
     * public 파일 업로드
     * - Multer memoryStorage(file.buffer)와 diskStorage(file.path) 모두 지원
     * - 업로드 성공 후 diskStorage라면 임시 파일 삭제
     */
    async uploadImage(
        files: Express.Multer.File[],
        targetEntity: Review | Store | User | Event | GiftCard | Promotion,
        uploadType: UploadType
    ): Promise<File[]> {
        this.logger.log(`uploadImage START (${uploadType})`);
        const uploadedFiles: File[] = [];

        try {
            for (const file of files) {
                const uuid = uuidv4();
                const ext = path.extname(file.originalname) || '';
                const folderPrefix = this.getFolderByUploadType(uploadType);
                const s3Key = `public/${folderPrefix}/${uuid}${ext}`;

                // 메모리/디스크 모두 대응
                const body =
                    typeof file.buffer !== 'undefined'
                        ? file.buffer
                        : (file.path ? readFileSync(file.path) : undefined);

                if (!body) {
                    this.logger.error(`uploadImage: file body is empty (uploadType=${uploadType})`);
                    throw new Error('Empty file body');
                }

                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                    Body: body,
                    ContentType: file.mimetype,
                }));

                // diskStorage 임시파일 정리
                if (file.path && existsSync(file.path)) {
                    try { unlinkSync(file.path); } catch { /* ignore */ }
                }

                const url = `${this.domain ? this.domain : ''}/${s3Key}`.replace(/([^:]\/)\/+/g, '$1');
                const dbFileName = file.originalname;

                const fileData: Partial<File> = {
                    file_name: dbFileName,
                    url,
                    content_type: file.mimetype,
                    upload_type: uploadType,
                };

                // 필요 시 엔티티 연관 추가 (현재는 URL만 쓰므로 주석 유지 가능)
                switch (uploadType) {
                    case UploadType.REVIEW_IMAGE:
                        fileData.review = targetEntity as Review;
                        break;
                    case UploadType.PROFILE_IMG:
                        fileData.user = targetEntity as User;
                        break;
                    // case UploadType.STORE_PROFILE:
                    //     fileData.store = targetEntity as Store;
                    //     break;
                    // case UploadType.EVENT_IMAGE:
                    //     fileData.event = targetEntity as Event;
                    //     break;
                    case UploadType.GIFT_CARD_IMAGE:
                        // fileData.giftCard = targetEntity as GiftCard;
                        break;
                    case UploadType.PROMOTION_IMAGE:
                        // fileData.promotion = targetEntity as Promotion;
                        break;
                    default:
                        this.logger.warn(`Unknown upload type: ${uploadType}`);
                }

                const fileEntity = this.fileRepository.create(fileData);
                const savedFile = await this.fileRepository.save(fileEntity);
                uploadedFiles.push(savedFile);
            }
        } catch (error) {
            this.logger.error('Error uploading files:', error as Error);
            throw new Error('Failed to upload files');
        }

        this.logger.log(`uploadImage END (${uploadType})`);
        return uploadedFiles;
    }

    async updateUserProfileImage(
        newFile: Express.Multer.File,
        user: User
    ): Promise<File> {
        this.logger.log('updateUserProfileImage START');

        const existingFile = await this.fileRepository.findOne({
            where: {
                user: { user_id: user.user_id },
                upload_type: UploadType.PROFILE_IMG
            },
        });

        if (existingFile) {
            const isDefault = existingFile.file_name.includes('default-profile');

            await this.fileRepository.delete(existingFile.file_id);

            if (!isDefault) {
                const key = this.getKeyFromUrl(existingFile.url);
                if (key) {
                    await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
                }
            }
        }

        const uploaded = await this.uploadImage([newFile], user, UploadType.PROFILE_IMG);

        this.logger.log('updateUserProfileImage END');
        return uploaded[0];
    }

    // 프로필사진 삭제 후 기본 프로필로 되돌리기
    async revertToDefaultProfileImage(user_id: number): Promise<File> {
        this.logger.log(`revertToDefaultProfileImage START for user: ${user_id}`);

        const existingFile = await this.fileRepository.findOne({
            where: {
                user: { user_id },
                upload_type: UploadType.PROFILE_IMG
            },
        });

        if (!existingFile) {
            return this.createDefaultProfileImage({ user_id } as User);
        }

        const isDefault = existingFile.file_name.includes('default-profile');
        if (!isDefault) {
            const key = this.getKeyFromUrl(existingFile.url);
            if (key) {
                await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
            }
        }

        existingFile.file_name = 'default-profile.png';
        existingFile.url = 'https://team-rta.s3.ap-northeast-2.amazonaws.com/public/profile_img/default-profile.png';
        existingFile.content_type = 'image/jpg';

        const updatedFile = await this.fileRepository.save(existingFile);

        this.logger.log(`revertToDefaultProfileImage END for user: ${user_id}`);
        return updatedFile;
    }

    /**
     * 파일명(Key)로 삭제 (기존 로직 유지)
     * 주의: 여기서 file_name은 S3 Key가 아닌 "원본 파일명"일 수 있음
     * 이 메서드는 필요 시에만 사용하고, 가급적 deleteByUrl을 추천
     */
    async deleteImage(file_name: string): Promise<string> {
        this.logger.log(`deleteImage START (by key or name: ${file_name})`);

        await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: file_name,
        }));

        // DB에서 삭제
        await this.fileRepository.delete({ file_name });

        this.logger.log(`deleteImage END`);
        return `File ${file_name} deleted successfully`;
    }

    /**
     * 퍼블릭 URL로 삭제 (프로모션/상품권처럼 URL만 있는 경우에 유용)
     */
    async deleteByUrl(url?: string | null): Promise<void> {
        if (!url) return;

        const key = this.getKeyFromUrl(url);
        if (!key) {
            this.logger.warn(`deleteByUrl: failed to extract key from url=${url}`);
            return;
        }

        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
            this.logger.log(`S3 deleted: ${key}`);
        } catch (e) {
            this.logger.warn(`deleteByUrl failed url=${url} err=${(e as Error).message}`);
            // 실패해도 전체 트랜잭션을 막을 필요는 없음
        }
    }

    /** URL에서 S3 Key 추출 (AWS_DOMAIN이 있으면 우선 사용) */
    private getKeyFromUrl(url?: string | null): string | null {
        if (!url) return null;

        // 1) .env의 AWS_DOMAIN 기준
        if (this.domain && url.startsWith(this.domain)) {
            const prefix = this.domain.endsWith('/') ? this.domain : `${this.domain}/`;
            return url.substring(prefix.length);
        }

        // 2) 일반 S3 퍼블릭 URL 패턴 추정
        const idx = url.indexOf('.amazonaws.com/');
        if (idx !== -1) {
            return url.substring(idx + '.amazonaws.com/'.length + url.substring(0, idx).length);
        }

        // 3) 마지막 폴백: ".com/" 기준
        const afterCom = url.split('.com/')[1];
        if (afterCom) return afterCom;

        // 4) 정말 안 되면 마지막 3개 세그먼트 조합
        const segs = url.split('/');
        return segs.length > 3 ? segs.slice(3).join('/') : null;
    }

    private getFolderByUploadType(uploadType: UploadType): string {
        switch (uploadType) {
            case UploadType.REVIEW_IMAGE:
                return 'review';
            case UploadType.PROFILE_IMG:
                return 'profile_img';
            case UploadType.STORE_PROFILE:
                return 'store';
            case UploadType.EVENT_IMAGE:
                return 'event';
            case UploadType.GIFT_CARD_IMAGE:
                return 'gift_card';
            case UploadType.PROMOTION_IMAGE:
                return 'promotion';
            default:
                return 'etc';
        }
    }

    async createDefaultProfileImage(user: User): Promise<File> {
        const defaultFile: Partial<File> = {
            file_name: 'default-profile.jpg',
            url: 'https://team-rta.s3.ap-northeast-2.amazonaws.com/public/profile_img/default-profile.jpg',
            content_type: 'image/jpg',
            upload_type: UploadType.PROFILE_IMG,
            user,
        };

        const fileEntity = this.fileRepository.create(defaultFile);
        return await this.fileRepository.save(fileEntity);
    }
}