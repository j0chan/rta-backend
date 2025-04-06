import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as express from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common'

dotenv.config() // 환경변수 load

async function bootstrap() {

  const app = await NestFactory.create(AppModule)

  // 전역 ValidationPipe 설정 추가
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 제거
      forbidNonWhitelisted: true, // DTO에 없는 값이 들어오면 예외 발생
      transform: true, // 자동 타입 변환 (예: string → number)
    }),
  )

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:8100', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // 정적 파일 제공 (public 폴더)
  app.use('/test', express.static(path.join(__dirname, '..', 'public')))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
