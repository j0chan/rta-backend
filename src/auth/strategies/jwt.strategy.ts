import { UsersService } from 'src/users/users.service'
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import * as dotenv from 'dotenv'
import { User } from 'src/users/entities/user.entity'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

dotenv.config()
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        // [3] Header에 있는 JWT토큰 추출
        super({
            secretOrKey: String(process.env.JWT_SECRET),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    } // [4] SecretKey로 검증 - 인스턴스가 생성되는 시점 자체가 검증과정

    // [5] JWT에서 사용자 정보 가져오기
    async validate(payload: JwtPayload) {
        const { user_id } = payload

        const user: User = await this.usersService.readUserById(user_id)
        if (!user) {
            throw new UnauthorizedException("Invalid Token: User Not Found")
        }

        return {
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            profile_image: user.profile_image.url
        }
    }
}