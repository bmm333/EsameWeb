import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './schelduing.service.js';
import { SchedulingController } from './schelduing.controller.js';
import { Schedule } from './entities/scheldue.entity.js';
import { RecommendationModule } from '../recommendation/recommendation.module.js';
import { UserModule } from '../user/user.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { WeatherModule } from '../weather/weather.module.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    forwardRef(() => UserModule),
    forwardRef(() => RecommendationModule),
    forwardRef(() => NotificationModule),
    WeatherModule
  ],
  providers: [SchedulingService],
  controllers: [SchedulingController],
  exports: [SchedulingService]
})
export class SchedulingModule {}