import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidController } from './rfid.controller.js';
import { RfidService } from './rfid.service.js';
import { RfidDevice } from './entities/rfid-device.entity.js';
import { RfidTag } from './entities/rfid-tag.entity.js';
import { Item } from '../item/entities/item.entity.js';
import { UserModule } from '../user/user.module.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([RfidDevice, RfidTag, Item]),
    UserModule,
  ],
  controllers: [RfidController],
  providers: [RfidService],
  exports: [RfidService]
})
export class RfidModule {}