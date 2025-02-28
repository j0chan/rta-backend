import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoresModule } from './stores/stores.module'
import { EventsModule } from './events/events.module'
import { ReviewsModule } from './reviews/reviews.module'
import { typeOrmConfig } from './config/typeorm.config'
import { MapsModule } from './maps/maps.module'
import { OpenaiModule } from './openai/openai.module'
import { ReviewRepliesController } from './review-replies/review-replies.controller';
import { ReviewRepliesService } from './review-replies/review-replies.service';
import { ReviewRepliesModule } from './review-replies/review-replies.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule,
    EventsModule,
    MapsModule,
    ReviewsModule,
    OpenaiModule,
    ReviewRepliesModule
  ],
  controllers: [ReviewRepliesController],
  providers: [ReviewRepliesService],
  // controllers: [AppController, UsersController, StoresController, EventsController, MapsController],
  // providers: [AppService, UsersService, StoresService, EventsService, MapsService],
    
})
export class AppModule {}
