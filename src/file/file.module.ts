import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File } from './entities/file.entity'
import { Review } from 'src/reviews/entites/review.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Review]),
    ],
    providers: [FileService],
    controllers: [FileController],
    exports: [FileService],
})
export class FileModule { }