import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { StoresModule } from 'src/stores/stores.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Menu]),
        StoresModule
    ],
    providers: [MenusService],
    controllers: [MenusController],
    exports: [MenusService],
})
export class MenusModule { }
