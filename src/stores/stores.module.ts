import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresService } from './stores.service'
import { StoresController } from './stores.controller'
import { Store } from './entities/store.entity'
import { UsersModule } from 'src/users/users.module'
import { Event } from './entities/event.entity'
import { Menu } from './entities/menu.entity'
import { Category } from './entities/category.entity'


@Module({
    imports: [
        TypeOrmModule.forFeature([Store]),
        TypeOrmModule.forFeature([Event]),
        TypeOrmModule.forFeature([Menu]),
        TypeOrmModule.forFeature([Category]),
        forwardRef(() => ReviewsModule),
        forwardRef(() => UsersModule),
        UsersModule,
    ],
    providers: [StoresService],
    controllers: [StoresController],
    exports: [StoresService]
})
export class StoresModule { }
