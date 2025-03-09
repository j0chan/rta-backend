import { Module } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
    imports: [
        UsersService
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
