import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { Notification } from './entities/notification.entity.js';
import { User } from '../user/entities/user.entity.js';
import { SchedulingModule } from '../schelduing/schelduing.module.js';
import { RecommendationModule } from '../recommendation/recommendation.module.js';
import { MailingModule } from '../mailing/mailing.module.js';
import { WeatherModule } from '../weather/weather.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    ScheduleModule.forRoot(),
    forwardRef(()=>SchedulingModule),
    RecommendationModule,
    MailingModule,
    WeatherModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}