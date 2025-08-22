import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutfitService } from './outfit.service.js';
import { OutfitController } from './outfit.controller.js';
import { Outfit } from './entities/outfit.entity.js';
import { Item } from '../item/entities/item.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outfit, Item])
  ],
  providers: [OutfitService],
  controllers: [OutfitController],
  exports: [OutfitService]
})
export class OutfitModule {}