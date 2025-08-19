import { Controller, Get, Put, Delete, Post, Body, UseGuards, Request, Dependencies, Bind, Param } from '@nestjs/common';
import { SettingService } from './settings.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';


@Controller('settings')
@Dependencies(SettingService)
export class SettingsController{
    constructor(settingsService)
    {this.settingsService=settingsService;
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    @Bind(Request())
    async getSettings(req)
    {
        return this.settingsService.getUserSettings(req.user.id||req.user.userId);
    }
    @UseGuards(JwtAuthGuard)
    @Put()
    @Bind(Request(), Body())
    async updateSettings(req, settingsDto) {
        return this.settingsService.updateUserSettings(req.user.id || req.user.userId, settingsDto);
    }
    @UseGuards(JwtAuthGuard)
    @Delete()
    @Bind(Request())
    async deleteAccount(req) {
        return this.settingsService.deleteUserAccount(req.user.id || req.user.userId);
    }
    @UseGuards(JwtAuthGuard)
    @Put('password')
    @Bind(Request(),Body())
    async changePassword(req,passwordData)
    {
        return this.settingsService.changePassword(req.user.id||req.user.userId,passwordData);
    }
    @UseGuards(JwtAuthGuard)
    @Post('upload-photo')
    @Bind(Request(),Body())
    async uploadProfilePhoto(req,photoData){
        return this.settingsService.uploadProfilePhoto(req.user.id||req.user.userId,photoData);
    }
    @UseGuards(JwtAuthGuard)
    @Delete('photo')
    @Bind(Request())
    async removeProfilePhoto(req)
    {
        return this.settingsService.removeProfilePhoto(req.user.id||req.user.userId);
    }
    @UseGuards(JwtAuthGuard)
    @Post('resend-verification')
    @Bind(Request())
    async resendVerificationEmail(req)
    {
        return this.settingsService.resendVerificationEmail(req.user.id||req.user.userId);
    }
    @UseGuards(JwtAuthGuard)
    @Put('email')
    @Bind(Request(), Body())
    async changeEmail(req, emailData) {
        return this.settingsService.changeEmail(req.user.id || req.user.userId, emailData);
    }

    @UseGuards(JwtAuthGuard)
    @Put('reset-defaults/:section')
    @Bind(Request(), Param('section'))
    async resetToDefaults(req, section) {
        return this.settingsService.resetToDefaults(req.user.id || req.user.userId, section);
    }
}