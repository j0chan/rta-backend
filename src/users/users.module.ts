import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { ManagerRequestsModule } from 'src/manager-requests/manager-requests.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(()=>ManagerRequestsModule),
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
