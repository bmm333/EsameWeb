import { Controller, Dependencies,Get, Post, Put, Body, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@Dependencies(NotificationService)
export class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }

    @Get()
    async getUserNotifications(@Req() req, @Query() query) {
        const userId = req.user.id;
        const limit = parseInt(query.limit) || 20;
        return await this.notificationService.getUserNotifications(userId, limit);
    }

    @Post('push/subscribe')
    async subscribeToPush(@Req() req, @Body() subscription) {
        const userId = req.user.id;
        return await this.notificationService.subscribeToPush(userId, subscription);
    }

    @Post('push/unsubscribe')
    async unsubscribeFromPush(@Req() req) {
        const userId = req.user.id;
        return await this.notificationService.unsubscribeFromPush(userId);
    }
    @Post('rfid-trigger')
    async triggerRfidNotification(@Req() req, @Body() body) {
        const userId = req.user.id;
        const { itemId } = body;
        return await this.notificationService.sendRfidNotification(userId, itemId);
    }

    @Put(':id/read')
    async markAsRead(@Req() req, @Param('id', ParseIntPipe) notificationId) {
        const userId = req.user.id;
        return await this.notificationService.markAsRead(userId, notificationId);
    }
    @Post('test-push')
    async testPushNotification(@Req() req) {
        const userId = req.user.id;
        return await this.notificationService.sendRfidNotification(userId, 'test-item-id');
    }
}