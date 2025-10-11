import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Promotion } from './entities/promotion.entity';
import { PromotionController } from './promotions.controller';
import { PromotionService } from './promotions.service';
import { FileModule } from 'src/file/file.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Promotion,]),
        FileModule,
        MulterModule.register({
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    ],
    controllers: [
        PromotionController,
    ],
    providers: [
        PromotionService,
    ],
})
export class PromotionModule { }
