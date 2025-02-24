import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import * as dotenv from 'dotenv'
import { Event } from "src/events/entities/event.entity"

dotenv.config()

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mysql', // 사용할 데이터베이스 유형 (MySQL, PostgreSQL, SQLite 등)
    host: process.env.DB_HOST, // 데이터베이스 호스트
    port: Number(process.env.DB_PORT), // 데이터베이스 포트
    username: process.env.DB_USER, // 데이터베이스 사용자 이름
    password: process.env.DB_PW, // 데이터베이스 비밀번호
    database: process.env.DB_NAME, // 사용할 데이터베이스 이름
    entities: [Event], // 엔티티 파일의 위치
    synchronize: true, // 애플리케이션 실행 시 스키마를 동기화할지 여부 (개발 중에만 true로 설정)
    logging: true, // SQL 쿼리 로그를 출력할지 여부
}