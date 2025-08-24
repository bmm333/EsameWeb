import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './schelduing.service.js';
import { SchedulingController } from './schelduing.controller.js';
import { Schedule } from './entities/scheldue.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule])
  ],
  providers: [SchedulingService],
  controllers: [SchedulingController],
  exports: [SchedulingService]
})
export class SchedulingModule {}