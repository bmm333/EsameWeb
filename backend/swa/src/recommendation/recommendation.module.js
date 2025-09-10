import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationController } from './recommendation.controller.js';
import { RecommendationService } from './recommendation.service.js';
import { Recommendation } from './entities/recommendation.entity.js';
import { Item } from '../item/entities/item.entity.js';
import { MailingModule } from '../mailing/mailing.module.js';
@Module({
    imports: [
        TypeOrmModule.forFeature([Recommendation, Item]),
        MailingModule
    ],
    controllers: [RecommendationController],
    providers: [RecommendationService],
    exports: [RecommendationService]
})
export class RecommendationModule {}