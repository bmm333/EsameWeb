import { Controller, Get, Put, Delete, Body, UseGuards, Request, Dependencies, Bind, Param } from '@nestjs/common';
import { SettingService } from './settings.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('settings')
@Dependencies(SettingService)
export class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;}

    @UseGuards(JwtAuthGuard)
    @Get()
    @Bind(Request())
    async getSettings(req) 
    {
        return this.settingsService.getUserSettings(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    @Bind(Request(), Body())
    async updateSettings(req, settingsDto) 
    {
        return this.settingsService.updateUserSettings(req.user.id, settingsDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('password')
    @Bind(Request(), Body())
    async changePassword(req, passwordData)
     {
        return this.settingsService.changePassword(req.user.id, passwordData);
    }

    @UseGuards(JwtAuthGuard)
    @Put('email')
    @Bind(Request(), Body())
    async changeEmail(req, emailData) {
        return this.settingsService.changeEmail(req.user.id, emailData);
    }

    @UseGuards(JwtAuthGuard)
    @Put('reset-defaults/:section')
    @Bind(Request(), Param('section'))
    async resetToDefaults(req, section) {
        return this.settingsService.resetToDefaults(req.user.id, section);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('account')
    @Bind(Request())
    async deleteAccount(req) 
    {
        return this.settingsService.deleteUserAccount(req.user.id);
    }
}