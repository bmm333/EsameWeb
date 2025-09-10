import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { OutfitModule } from './outfit/outfit.module';
import { RfidModule } from './rfid/rfid.module';
import { UserModule } from './user/user.module';
import { ValidationMiddleware } from './common/middleware/validation.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { dataSourceOptions } from '../database.config.js';
import { MailingModule } from './mailing/mailing.module';
import { SettingsModule } from './settings/settings.module';
import { MediaModule } from './media/media.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WeatherModule } from './weather/weather.module';



@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    ItemModule,
    OutfitModule,
    RfidModule,
    MailingModule,
    SettingsModule,
    MediaModule,
    DashboardModule,
    AnalyticsModule,
    WeatherModule
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