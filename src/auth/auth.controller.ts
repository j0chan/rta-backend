import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // 'auth' 경로로 들어오는 요청을 처리하는 컨트롤러
export class AuthController {
    constructor(private authService: AuthService) {} // AuthService를 의존성 주입으로 받아옴
}
