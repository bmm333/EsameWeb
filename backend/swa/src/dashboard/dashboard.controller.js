import { Controller, Get, Req, UseGuards,Dependencies,Inject  } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(@Inject(DashboardService) dashboardService) {
        this.dashboardService = dashboardService;
    }
    @Get()
    async getDashboard(@Req() req) {
        const userId = req.user.id;
        return await this.dashboardService.getDashboardData(userId);
    }


    @Get('stats')
    async getStats(@Req() req) {
        const userId = req.user.id;
        return await this.dashboardService.getWardrobeStats(userId);
    }

    @Get('activity')
    async getActivity(@Req() req) {
        const userId = req.user.id;
        return await this.dashboardService.getRecentActivity(userId);
    }


    @Get('today-outfit')
    async getTodaysOutfit(@Req() req) {
        const userId = req.user.id;
        return await this.dashboardService.getTodaysOutfit(userId);
    }

    @Get('quick-actions')
    async getQuickActions(@Req() req) {
        const userId = req.user.id;
        return await this.dashboardService.getQuickActions(userId);
    }
}