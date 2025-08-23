import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service.js';
import { SchedulingController } from './scheduling.controller.js';
import { Schedule } from './entities/schedule.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule])
  ],
  providers: [SchedulingService],
  controllers: [SchedulingController],
  exports: [SchedulingService]
})
export class SchedulingModule {}