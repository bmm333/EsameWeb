import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SchedulingService } from './scheduling.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('scheduling')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
    constructor(schedulingService) {
        this.schedulingService = schedulingService;
    }


    @Post()
    async createSchedule(@Req() req, @Body() createScheduleDto) {
        const userId = req.user.id;
        return await this.schedulingService.createSchedule(userId, createScheduleDto);
    }


    @Get()
    async getAllSchedules(@Req() req, @Query() query) {
        const userId = req.user.id;
        const filters = {
            type: query.type,
            isActive: query.active === 'true' ? true : query.active === 'false' ? false : undefined,
            occasion: query.occasion
        };
        
        return await this.schedulingService.getAllSchedules(userId, filters);
    }


    @Get(':id')
    async getScheduleById(@Req() req, @Param('id', ParseIntPipe) scheduleId) {
        const userId = req.user.id;
        return await this.schedulingService.getScheduleById(userId, scheduleId);
    }


    @Put(':id')
    async updateSchedule(
        @Req() req, 
        @Param('id', ParseIntPipe) scheduleId, 
        @Body() updateScheduleDto
    ) {
        const userId = req.user.id;
        return await this.schedulingService.updateSchedule(userId, scheduleId, updateScheduleDto);
    }


    @Delete(':id')
    async deleteSchedule(@Req() req, @Param('id', ParseIntPipe) scheduleId) {
        const userId = req.user.id;
        return await this.schedulingService.deleteSchedule(userId, scheduleId);
    }


    @Put(':id/toggle')
    async toggleSchedule(@Req() req, @Param('id', ParseIntPipe) scheduleId) {
        const userId = req.user.id;
        return await this.schedulingService.toggleSchedule(userId, scheduleId);
    }

    @Get('system/triggered')
    async getTriggeredSchedules() {
        return await this.schedulingService.getTriggeredSchedules();
    }
}