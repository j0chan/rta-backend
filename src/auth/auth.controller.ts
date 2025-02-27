import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';


@Controller('api/auth') // 'auth' 경로로 들어오는 요청을 처리하는 컨트롤러
export class AuthController {
    constructor(private authService: AuthService) {} // AuthService를 의존성 주입으로 받아옴
    
    // 회원 가입 기능
    @Post('/signup')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const userResponseDto = new UserResponseDto(await this.authService.createUser(createUserDto))
        return userResponseDto;
    }

}