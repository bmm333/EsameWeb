import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { OutfitModule } from './outfit/outfit.module';
import { NotificationModule } from './notification/notification.module';
import { RfidModule } from './rfid/rfid.module';
import { UserModule } from './user/user.module';
import { ValidationMiddleware } from './common/middleware/validation.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { dataSourceOptions } from './common/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    ItemModule,
    OutfitModule,
    NotificationModule,
    RfidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware, ValidationMiddleware)
      .forRoutes('user');
  }
}