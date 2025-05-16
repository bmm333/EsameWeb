import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { OutfitModule } from './outfit/outfit.module';
import { NotificationModule } from './notification/notification.module';
import { RfidModule } from './rfid/rfid.module';

@Module({
  imports: [UsersModule, AuthModule, ItemModule, OutfitModule, NotificationModule, RfidModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
