import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './users/users.controller'
import { UsersService } from './users/users.service'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    StoresModule
  ],
  controllers: [AppController, UsersController, StoresController],
  providers: [AppService, UsersService, StoresService],
})
export class AppModule {}
