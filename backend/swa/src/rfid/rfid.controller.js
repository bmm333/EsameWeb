import { Controller, Delete, Post, Get, Put, Body, Param, Headers, UseGuards, Request, Dependencies, Bind } from '@nestjs/common';
import { RfidService } from './rfid.service.js';
import { DeviceRegistrationDto } from './dto/device-registration.dto.js';
import { WiFiConfigDto } from './dto/wifi-config.dto.js';
import { RfidRealtimeDto } from './dto/rfid-realtime.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('rfid')
@Dependencies(RfidService)
export class RfidController {
    constructor(rfidService) {
        this.rfidService = rfidService;
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('device/generate-key')
    @Bind(Request(), Body())
    async generateDeviceApiKey(req, deviceData) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.generateDeviceApiKey(userId, deviceData);
    }

    @UseGuards(JwtAuthGuard)
    @Post('device/register')
    @Bind(Request(), Body())
    async registerDevice(req, deviceData) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.registerDevice(userId, deviceData);
    }

    @Put('device/:serial/wifi-confirm')
    @Bind(Param('serial'), Body())
    async confirmWiFiConfiguration(serial, wifiConfig) {
        return this.rfidService.confirmWiFiConfiguration(serial, wifiConfig);
    }

    @Post('device/:serial/activate')
    @Bind(Param('serial'), Body())
    async activateDevice(serial, activationData) {
        return this.rfidService.activateDevice(serial, activationData?.ipAddress);
    }

    @Post('scan')
    @Bind(Headers(), Body())
    async processRealtimeScan(headers, scanData) {
        const apiKey = headers['x-api-key'];
        if (!apiKey) {
        throw new BadRequestException('API key required in x-api-key header');
        }
        return this.rfidService.processRealtimeRfidScan(apiKey, scanData);
    }

    @Post('heartbeat')
    @Bind(Headers())
    async deviceHeartbeat(headers) {
        const apiKey = headers['x-api-key'];
        if (!apiKey) {
        throw new BadRequestException('API key required in x-api-key header');
        }
        return this.rfidService.updateDeviceHeartbeat(apiKey);
    }

    @UseGuards(JwtAuthGuard)
    @Post('tags/:tagId/associate')
    @Bind(Request(), Param('tagId'), Body())
    async associateTag(req, tagId, body) {
        const userId = req.user.id || req.user.userId;
        const { itemId, forceOverride = false } = body;
        return this.rfidService.associateTagWithItem(userId, tagId, itemId, forceOverride);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('tags/:tagId/dissociate')
    @Bind(Request(), Param('tagId'))
    async dissociateTag(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.dissociateTagFromItem(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('tags/:tagId/info')
    @Bind(Request(), Param('tagId'))
    async getTagInfo(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.getTagInfo(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    @Bind(Request())
    async getDeviceStatus(req) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.getDeviceStatus(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('tags/unassociated')
    @Bind(Request())
    async getUnassociatedTags(req) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.getUnassociatedTags(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('tags')
    @Bind(Request())
    async getUserTags(req) {
        const userId = req.user.id || req.user.userId;
        return this.rfidService.getUserTags(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('devices')
    @Bind(Request())
    async getUserDevices(req) {
        const userId = req.user.id || req.user.userId;
        const status = await this.rfidService.getDeviceStatus(userId);
        return {
            devices: status.hasDevice ? [status.device] : [],
            totalDevices: status.hasDevice ? 1 : 0,
            setupRequired: !status.hasDevice
        };
    }
}