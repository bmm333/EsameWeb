import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, Dependencies, Bind } from '@nestjs/common';
import { RfidService } from './rfid.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('rfid')
@Dependencies(RfidService)
export class RfidController {
  constructor(rfidService) {
    this.rfidService = rfidService;
  }
  //Device reg (during onboarding)
  @UseGuards(JwtAuthGuard)
  @Post('device/register')
  @Bind(Request(), Body())
  async registerDevice(req, deviceData) {
    const userId = req.user.id || req.user.userId;
    return this.rfidService.registerDevice(userId, deviceData);
  }

  // Device configuration (WiFi setup via Bluetooth)
  @Put('device/:serial/configure')
  @Bind(Param('serial'), Body())
  async configureDevice(serial, config) {
    return this.rfidService.configureDevice(serial, config);
  }

  // Device activation
  @Post('device/:serial/activate')
  @Bind(Param('serial'))
  async activateDevice(serial) {
    return this.rfidService.activateDevice(serial);
  }

  // RFID scan data
  @Post('scan')
  @Bind(Body())
  async processScan(scanData) {
    return this.rfidService.processRfidScan(scanData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  @Bind(Request())
  async getStatus(req) {
    const userId = req.user.id || req.user.userId;
    return this.rfidService.getDeviceStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  @Bind(Request())
  async getUserDevices(req) {
    const userId = req.user.id || req.user.userId;
    return this.rfidService.getUserDevices(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('tags')
  @Bind(Request())
  async getUserTags(req) {
    const userId = req.user.id || req.user.userId;
    return this.rfidService.getUserTags(userId);
  }
  @Post('device/:serial/heartbeat')
  @Bind(Param('serial'))
  async deviceHeartbeat(serial) {
    return this.rfidService.updateDeviceHeartbeat(serial);
  }
}
