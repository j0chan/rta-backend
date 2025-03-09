import { SignInDTO } from './DTO/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDTO } from './../users/DTO/create-user.dto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';


@Injectable()
export class AuthService {
    // init
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Sign-Up
    async signUp(createUserDTO: CreateUserDTO): Promise<void> {
        const { email, password, nickname, phone_number, role } = createUserDTO
        if (!email || !password || !nickname || !phone_number || !role) {
            throw new BadRequestException('Something Went Wrong!')
        }

        await this.usersService.checkEmailExist(email)

        const hashedPassword = await this.hashPassword(password)

        await this.usersService.createUser({
            email,
            password: hashedPassword,
            nickname,
            phone_number,
            role,
        })
    }

    // Sign-In
    async signIn(signInDTO: SignInDTO): Promise<string> {
        const { email, password } = signInDTO

        try {
            const existingUser = await this.usersService.findUserByEmail(email)

            if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
                throw new UnauthorizedException('Invalid Credentials!')
            }

            // [1] JWT 토큰 생성
            const payload = {
                id: existingUser.user_id,
                email: existingUser.email,
                nickname: existingUser.nickname,
                role: existingUser.role
            }
            const accessToken = await this.jwtService.sign(payload)

            return accessToken
        } catch {
            throw error
        }
    }

    // 비밀번호 암호화(해싱)
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt()
        return await bcrypt.hash(password, salt)
    }
}
