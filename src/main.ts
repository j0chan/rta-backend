import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as express from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config() // 환경변수 load

async function bootstrap() {

  const app = await NestFactory.create(AppModule)

  // CORS 설정 추가
  app.enableCors({
    origin: ['http://localhost:8100', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // 정적 파일 제공 (public 폴더)
  app.use('/test', express.static(path.join(__dirname, '..', 'public'))) // 루트까지(..) 이동한 뒤, public을 찾는다.

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
