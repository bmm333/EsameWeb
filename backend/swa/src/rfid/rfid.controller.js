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
  @Bind(Request(),Body())
  async registerDevice(req, deviceData) {
    const userId=req.user.id||req.user.userId;
    return this.rfidService.registerDevice(userId, deviceData);
  }
}
