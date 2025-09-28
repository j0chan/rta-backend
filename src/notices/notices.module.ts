import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notice])],
    providers: [NoticesService],
    controllers: [NoticesController],
    exports: [NoticesService],
})
export class NoticesModule {}