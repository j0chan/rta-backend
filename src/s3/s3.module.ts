import { Module } from '@nestjs/common'
import { S3Service } from './s3.service'
import { S3Controller } from './s3.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Image } from './entities/images.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Image]),
    ],
    providers: [S3Service],
    controllers: [S3Controller],
    exports: [S3Service],
})
export class S3Module { }