import { Module } from '@nestjs/common';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';

@Module({
  controllers: [RfidController],
  providers: [RfidService]
})
export class RfidModule {}
