import { Controller,Dependencies, Inject,Get, Post, Put, Body, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service.js';
import { GenerateRecommendationDto } from './dto/generate-recommendation.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('recommendation')
@Dependencies(RecommendationService)
export class RecommendationController {
  constructor(@Inject(RecommendationService) recommendationService) {
    this.recommendationService = recommendationService;
  }
    @Post('generate')
    async generateRecommendations(@Req() req, @Body() generateDto) {
        const userId = req.user.id;
        return await this.recommendationService.generateOutfitRecommendations(userId, generateDto);
    }
    @Get('today')
    async getTodaysRecommendations(@Req() req) {
        const userId = req.user.id;
        return await this.recommendationService.getTodaysRecommendations(userId);
    }
    @Post('scheduled')
    async generateScheduledRecommendations(@Req() req, @Body() body) {
        const userId = req.user.id;
        const { occasion = 'any', weatherData = null } = body;
        return await this.recommendationService.generateScheduledRecommendations(userId, occasion, weatherData);
    }

    @Post('rfid-trigger')
    async generateRfidRecommendation(@Req() req, @Body() body) {
        const userId = req.user.id;
        const { itemId } = body;
        return await this.recommendationService.generateRfidTriggeredRecommendation(userId, itemId);
    }

    @Put(':id/feedback')
    async updateFeedback(@Req() req, @Param('id', ParseIntPipe) recommendationId, @Body() feedback) {
        const userId = req.user.id;
        return await this.recommendationService.updateRecommendationFeedback(userId, recommendationId, feedback);
    }

    @Get('stats')
    async getStats(@Req() req) {
        const userId = req.user.id;
        return await this.recommendationService.getRecommendationStats(userId);
    }
}