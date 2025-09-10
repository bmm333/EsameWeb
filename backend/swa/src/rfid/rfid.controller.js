import { Controller, Dependencies, Post, Get, Body, Param, Headers, UseGuards, Request } from '@nestjs/common';
import { RfidService } from './rfid.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TrialGuard } from '../common/guard/trial.guard.js';

@Controller('rfid')
@Dependencies(RfidService)
export class RfidController {
    constructor(rfidService) {
        this.rfidService = rfidService;
    }

    @Post('scan')
    async scan(@Headers('x-api-key') apiKey, @Body() scanData) {
        console.log('[RFID] Scan received:', scanData);
        return this.rfidService.processScan(apiKey, scanData);
    }

    @Get('scan')
    @UseGuards(JwtAuthGuard)
    async getLatestScan(@Request() req) {
        return this.rfidService.getLatestScan(req.user.id);
    }

    @Post('scan/clear')
    @UseGuards(JwtAuthGuard)
    async clearScanCache(@Request() req) {
        await this.rfidService.clearScanCache(req.user.id);
        return { success: true };
    }

    @Post('association-mode')
    @UseGuards(JwtAuthGuard)
    async setAssociationMode(@Request() req, @Body() body) {
        await this.rfidService.setAssociationMode(req.user.id, body.active);
        return { success: true };
    }

    @Post('tags/:tagId/associate')
    @UseGuards(JwtAuthGuard)
    async associateTag(@Request() req, @Param('tagId') tagId, @Body() body) {
        const { itemId, forceOverride = false } = body;
        return this.rfidService.associateTag(req.user.id, tagId, itemId, forceOverride);
    }

    @Post('heartbeat')
    async heartbeat(@Headers('x-api-key') apiKey) {
        return this.rfidService.heartbeat(apiKey);
    }

    @Post('device/generate-key')
    @UseGuards(JwtAuthGuard, TrialGuard)
    async generateKey(@Request() req, @Body() body) {
        return this.rfidService.generateApiKey(req.user.id, body.deviceName);
    }

    @Get('devices')
    @UseGuards(JwtAuthGuard, TrialGuard)
    async getDevices(@Request() req) {
        return this.rfidService.getDeviceStatus(req.user.id);
    }

    @Get('tags')
    @UseGuards(JwtAuthGuard, TrialGuard)
    async getTags(@Request() req) {
        return this.rfidService.getTags(req.user.id);
    }
}