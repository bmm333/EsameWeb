import { Module } from '@nestjs/common';
import { OutfitService } from './outfit.service';
import { OutfitController } from './outfit.controller';

@Module({
  providers: [OutfitService],
  controllers: [OutfitController]
})
export class OutfitModule {}
