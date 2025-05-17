import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { OutfitModule } from './outfit/outfit.module';
import { NotificationModule } from './notification/notification.module';
import { RfidModule } from './rfid/rfid.module';
import { UserModule } from './user/user.module';
import { LoggerMiddleware} from './common/middleware/logger.middleware';

@Module({
  imports: [UserModule,AuthModule, ItemModule, OutfitModule, NotificationModule, RfidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
 /* configure(consumer)
  {
    consumer.apply(LoggerMiddleware).forRoutes(aroutewillgohere);
  }*/
}
