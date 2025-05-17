import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { Review } from './entites/review.entity'
import { StoresModule } from 'src/stores/stores.module'
import { UsersModule } from 'src/users/users.module'
import { File } from 'src/file/entities/file.entity'
import { FileModule } from 'src/file/file.module'
import { MyReviewsController } from './my-reviews.controller'

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, File]),
        StoresModule,
        UsersModule,
        FileModule
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController, MyReviewsController],
    exports: [ReviewsService]
})
export class ReviewsModule { }