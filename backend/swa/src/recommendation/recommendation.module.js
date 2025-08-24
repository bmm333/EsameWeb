import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationService } from './recommendation.service.js';
import { RecommendationController } from './recommendation.controller.js';
import { Recommendation } from './entities/recommendation.entity.js';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';
import { User } from '../user/entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, Item, Outfit, User])
  ],
  providers: [RecommendationService], 
  controllers: [RecommendationController],
  exports: [RecommendationService] 
})
export class RecommendationModule {}