import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { File } from 'src/file/entities/file.entity'
import { FileModule } from 'src/file/file.module'


@Module({
    imports: [
        TypeOrmModule.forFeature([User, File]),
        FileModule
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
