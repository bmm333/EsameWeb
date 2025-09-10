import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';
import { User } from '../user/entities/user.entity.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Outfit, User]),AnalyticsModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService]
})
export class DashboardModule {}