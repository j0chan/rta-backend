import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { File } from 'src/file/entities/file.entity'
import { FileModule } from 'src/file/file.module'
import { UserPoint } from './entities/user-point.entity'
import { GiftCardPocket } from 'src/gift-cards/entities/gift-card-pocket.entity'


@Module({
    imports: [
        TypeOrmModule.forFeature([User, File, UserPoint, GiftCardPocket]),
        FileModule
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
