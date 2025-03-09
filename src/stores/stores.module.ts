import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresService } from './stores.service'
import { StoresController } from './stores.controller'
import { Store } from './entities/store.entity'
import { ReviewsModule } from 'src/reviews/reviews.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([Store]),
        forwardRef(() => ReviewsModule)
    ],
    providers: [StoresService],
    controllers: [StoresController],
    exports: [StoresService]
})
export class StoresModule { }
