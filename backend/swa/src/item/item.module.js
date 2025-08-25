import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { Item } from './entities/item.entity.js';
import { RfidTag } from '../rfid/entities/rfid-tag.entity.js';
import { MediaModule } from '../media/media.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item, RfidTag]),MediaModule],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService]
})
export class ItemModule {}