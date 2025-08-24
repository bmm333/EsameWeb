import { Injectable, Dependencies, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/scheldue.entity.js';

@Injectable()
@Dependencies('ScheduleRepository')
export class SchedulingService{
    constructor(@InjectRepository(Schedule)scheduleRepository)
    {
        this.scheduleRepository=scheduleRepository;
    }
    async createSchedule(userId,createScheduleDto)
    {
        try{
            if(createScheduleDto.time&&!this.isValidTimeFormat(createScheduleDto.time))
            {
                throw new BadRequestException('Invalid time format');
            }
            if(createScheduleDto.daysOfWeek&&!this.isValidDaysOfWeek(createScheduleDto.daysOfWeek))
            {
                throw new BadRequestException('Invalid days of week. Use numbers 0-6 (0=Sunday)');
            }
            const schedule=this.scheduleRepository.create({
                ...createScheduleDto,
                userId
            });
            return await this.scheduleRepository.save(schedule);
        }catch(error)
        {
            if(error instanceof BadRequestException)
            {
                throw error;
            }
            throw new BadRequestException('Failed to create schedule');
        }
    }
    async getAllSchedules(userId,filters={}){
        try{
            const query=this.scheduleRepository.createQueryBuilder('schedule')
            .where('schedule.userId=:userId',{userId})
            .orderBy('schedule.time','ASC');
            if(filters.type)
            {
                query.andWhere('schedule.type=:type',{type:filters.type});
            }
            if(filters.active!==undefined)
            {
                query.andWhere('schedule.isActive = :isActive', { isActive: filters.isActive });
            }
            if(filters.occasion)
            {
                query.andWhere('schedule.occasion=:occasion',{occasion:filters.occasion});
            }
            return await query.getMany();
        }catch(error)
        {
            throw new BadRequestException('Failed to fetch schedules');
        }
    }
    async getScheldueById(userId,scheduleId){
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { id: scheduleId, userId }
            });

            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }

            return schedule;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch schedule');
        }
    }
    async processTriggeredSchedules() {
        try {
            const triggeredSchedules = await this.getTriggeredSchedules();
            const results = [];

            for (const schedule of triggeredSchedules) {
                const recommendations = await this.recommendationService.generateScheduledRecommendations(
                    schedule.userId,
                    schedule.occasion || 'any',
                    schedule.includeWeatherCheck ? await this.getWeatherData() : null
                );

                results.push({
                    scheduleId: schedule.id,
                    userId: schedule.userId,
                    scheduleName: schedule.name,
                    recommendations: recommendations.recommendations,
                    message: schedule.message
                });
            }

            return results;
        } catch (error) {
            throw new BadRequestException('Failed to process triggered schedules');
        }
    }
    async updateSchedule(userId, scheduleId, updateScheduleDto) {
        try {
            const schedule = await this.getScheduleById(userId, scheduleId);

            if (updateScheduleDto.time && !this.isValidTimeFormat(updateScheduleDto.time)) {
                throw new BadRequestException('Invalid time format. Use HH:MM format');
            }

            if (updateScheduleDto.daysOfWeek && !this.isValidDaysOfWeek(updateScheduleDto.daysOfWeek)) {
                throw new BadRequestException('Invalid days of week. Use numbers 0-6 (0=Sunday)');
            }

            Object.assign(schedule, updateScheduleDto);
            return await this.scheduleRepository.save(schedule);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update schedule');
        }
    }
    async deleteSchedule(userId, scheduleId) {
        try {
            const schedule = await this.getScheduleById(userId, scheduleId);
            await this.scheduleRepository.remove(schedule);
            return { message: 'Schedule deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete schedule');
        }
    }
    async toggleSchedule(userId, scheduleId) {
        try {
            const schedule = await this.getScheduleById(userId, scheduleId);
            schedule.isActive = !schedule.isActive;
            return await this.scheduleRepository.save(schedule);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to toggle schedule');
        }
    }
    async getTriggeredSchedules() {
        try {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

            const schedules = await this.scheduleRepository.find({
                where: { isActive: true },
                relations: ['user']
            });
            return schedules.filter(schedule => {
                if (schedule.time && schedule.time !== currentTime) {
                    return false;
                }
                if (schedule.type === 'weekly' && schedule.daysOfWeek) {
                    return schedule.daysOfWeek.includes(currentDay);
                }
                if (schedule.type === 'daily') {
                    return true;
                }
                return false;
            });
        } catch (error) {
            throw new BadRequestException('Failed to get triggered schedules');
        }
    }
    
    isValidTimeFormat(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    isValidDaysOfWeek(days) {
        if (!Array.isArray(days)) return false;
        return days.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
    }
}