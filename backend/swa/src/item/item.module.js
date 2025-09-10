import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { Item } from './entities/item.entity.js';
import { RfidTag } from '../rfid/entities/rfid-tag.entity.js';
import { MediaModule } from '../media/media.module.js';
import { UserModule } from '../user/user.module.js'; 
import { User } from '../user/entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item, RfidTag]),MediaModule,UserModule],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService]
})
export class ItemModule {}