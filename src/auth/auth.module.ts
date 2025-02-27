import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([User]), // TypeORM을 사용하여 User 엔티티를 가져옴
    ],
    controllers: [AuthController], // AuthController를 이 모듈에 포함시킴
    providers: [AuthService], // AuthService를 이 모듈에 포함시킴
  })
  export class AuthModule {} // AuthModule 정의, 인증 관련 모든 로직을 이 모듈에서 관리
  