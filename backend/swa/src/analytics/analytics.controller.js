import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Get('basic-stats')
    async getBasicStats(@Req() req) {
        const userId = req.user.id;
        return await this.analyticsService.getBasicWardrobeStats(userId);
    }

    @Get()
    async getAnalytics(@Req() req) {
        const userId = req.user.id;
        return await this.analyticsService.getWardrobeAnalytics(userId);
    }


    @Get('insights')
    async getInsights(@Req() req) {
        const userId = req.user.id;
        return await this.analyticsService.getActionableInsights(userId);
    }


    @Get('rarely-used')
    async getRarelyUsed(@Req() req) {
        const userId = req.user.id;
        return await this.analyticsService.getRarelyUsedItems(userId);
    }
}