import { Controller, Get, Post, Put, Delete,Dependencies, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MailingService } from '../mailing/mailing.service.js';

@Controller('recommendation')
@Dependencies(RecommendationService, MailingService)
@UseGuards(JwtAuthGuard)
export class RecommendationController {
    constructor(recommendationService, mailingService) {
        this.recommendationService = recommendationService;
        this.mailingService = mailingService;
    }

    @Get()
    async getRecommendations(@Request() req, @Query() query) {
        return this.recommendationService.getRecommendations(req.user.id, query);
    }

    @Post('generate')
    async generateRecommendations(@Request() req, @Body() body) {
        const userId = req.user.id;
        const recommendations = await this.recommendationService.generateRecommendations(userId, body);
        try {
            await this.mailingService.sendRecommendationNotification(req.user, recommendations);
            console.log('Recommendation email sent to:', req.user.email);
        } catch (emailError) {
            console.error('Failed to send recommendation email:', emailError);
        }
        return recommendations;
    }

    @Get('history')
    async getHistory(@Request() req) {
        return this.recommendationService.getRecommendationHistory(req.user.id);
    }
    @Put(':id/reject')
    async rejectRecommendation(@Request() req, @Param('id') id, @Body() body) {
        const userId = req.user.id;
        const { reason } = body;
        return await this.recommendationService.rejectRecommendation(userId, id, reason);
    }
    @Post()
    async saveRecommendation(@Request() req, @Body() body) {
        return this.recommendationService.saveRecommendation(req.user.id, body);
    }

    @Put(':id/worn')
    async markAsWorn(@Request() req, @Param('id') id) {
        return this.recommendationService.markAsWorn(req.user.id, +id);
    }

    @Delete(':id')
    async deleteRecommendation(@Request() req, @Param('id') id) {
        return this.recommendationService.deleteRecommendation(req.user.id, +id);
    }
}