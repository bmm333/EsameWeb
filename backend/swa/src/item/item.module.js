import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { Item } from './entities/item.entity.js';
import { RfidTag } from '../rfid/entities/rfid-tag.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item, RfidTag])],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService]
})
export class ItemModule {}