import { Controller, Get, Req, UseGuards, Dependencies } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Dependencies(DashboardService)
export class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    @Get('stats')
    async getStats(@Req() req) {
        try {
            const userId = req.user.id;
            console.log('Getting stats for user:', userId);
            const stats = await this.dashboardService.getStats(userId);
            console.log('Response data:', stats);
            return stats;
        } catch (error) {
            console.error('Error in getStats:', error);
            return {
                totalItems: 0,
                totalOutfits: 0,
                availableItems: 0,
                wornItems: 0
            };
        }
    }

    @Get('outfit')
    async getTodaysOutfit(@Req() req) {
        try {
            const userId = req.user.id;
            console.log('Getting today\'s outfit for user:', userId);
            return await this.dashboardService.getTodaysOutfit(userId);
        } catch (error) {
            console.error('Error in getTodaysOutfit:', error);
            return {
                hasOutfit: false,
                message: 'Unable to load outfit suggestions at this time'
            };
        }
    }

    @Get('activity')
    async getActivity(@Req() req) {
        try {
            const userId = req.user.id;
            console.log('Getting activity for user:', userId);
            return await this.dashboardService.getRecentActivity(userId);
        } catch (error) {
            console.error('Error in getActivity:', error);
            return [];
        }
    }
}