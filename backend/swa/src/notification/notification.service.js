import { Injectable, Dependencies } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity.js';
import { RecommendationService } from '../recommendation/recommendation.service.js';
import { MailingService } from '../mailing/mailing.service.js';
import { User } from '../user/entities/user.entity.js';
import { SchedulingService } from '../schelduing/schelduing.service.js';
import webpush from 'web-push';
import { WeatherService } from '../weather/weather.service.js';


@Injectable()
@Dependencies('NotificationRepository', 'UserRepository', SchedulingService, RecommendationService, MailingService, WeatherService)
export class NotificationService {
    constructor(
        @InjectRepository(Notification) notificationRepository,
        @InjectRepository(User) userRepository,
        schedulingService,
        recommendationService,
        mailingService,
        weatherService
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.schedulingService = schedulingService;
        this.recommendationService = recommendationService;
        this.mailingService = mailingService;
        this.weatherService=weatherService;
        this.initializeWebPush();
    }

    initializeWebPush() {
        webpush.setVapidDetails(
            'mailto:benmema3@gmail.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY 
        );
    }
    @Cron('0 * * * * *') // Every minute at second 0
        async checkScheduledNotifications() {
            try {
                console.log('Checking for triggered schedules...', new Date().toISOString());
                
                const triggeredSchedules = await this.schedulingService.getTriggeredSchedules();
                if (triggeredSchedules.length === 0) {
                    console.log(' No schedules triggered at this time');
                    return;
                }

                console.log(`Found ${triggeredSchedules.length} triggered schedule(s)`);

                for (const schedule of triggeredSchedules) {
                    await this.processTriggeredSchedule(schedule);
                }
            } catch (error) {
                console.error('Error in scheduled recommendations cron job:', error);
            }
    }
    async processTriggeredSchedule(schedule) {
        try {
            console.log(`Processing schedule: ${schedule.name} for user ${schedule.userId}`);

            const user = await this.userRepository.findOne({
                where: { id: schedule.userId },
                select: ['id', 'firstName', 'enableRecommendations', 'enableOutfitReminders', 'pushSubscription']
            });

            if (!user) {
                console.error(` User with ID ${schedule.userId} not found`);
                return;
            }

            if (!user.enableRecommendations && !user.enableOutfitReminders) {
                console.log(`User ${user.firstName} has recommendations disabled`);
                return;
            }

            const recommendations = await this.recommendationService.generateScheduledRecommendations(
                schedule.userId,
                schedule.occasion || 'any',
                schedule.includeWeatherCheck ? await this.getWeatherData() : null
            );

            if (recommendations.count === 0) {
                console.log(`No recommendations generated for ${user.firstName}`);
                
                const notification = await this.createNotification(schedule.userId, {
                    type: 'outfit_suggestion',
                    title: 'No Outfits Available',
                    message: 'We couldn\'t find suitable outfit combinations right now. Check your wardrobe availability.',
                    data: { scheduleId: schedule.id, scheduleName: schedule.name }
                });

                await this.sendPushNotification(user, notification);
                return;
            }

            const notification = await this.createNotification(schedule.userId, {
                type: 'outfit_suggestion',
                title: schedule.message || `${schedule.name} - Outfit Ready!`,
                message: `${this.getGreeting()}! We've prepared ${recommendations.count} outfit suggestion${recommendations.count > 1 ? 's' : ''} for you.`,
                data: {
                    scheduleId: schedule.id,
                    scheduleName: schedule.name,
                    occasion: schedule.occasion,
                    recommendations: recommendations.recommendations.slice(0, 3),
                    weatherIncluded: schedule.includeWeatherCheck
                }
            });

            await this.sendPushNotification(user, notification);

            console.log(`Successfully processed schedule ${schedule.name} for ${user.firstName}`);

        } catch (error) {
            console.error(`Error processing schedule ${schedule.id}:`, error);
        }
    }
    async createNotification(userId, notificationData) {
        try {
            const notification = this.notificationRepository.create({
                userId,
                ...notificationData,
                status: 'pending'
            });

            return await this.notificationRepository.save(notification);
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    async sendPushNotification(user, notification) {
        try {
            const userSettings = await this.getUserNotificationSettings(user.id);
            
            if (!userSettings.pushOutfitReminders && notification.type === 'outfit_suggestion') {
                console.log(`Push notifications disabled for ${user.firstName}`);
                return;
            }

            if (!userSettings.pushRFIDAlerts && notification.type === 'rfid_alert') {
                console.log(`RFID alerts disabled for ${user.firstName}`);
                return;
            }

            if (!user.pushSubscription) {
                console.log(`No push subscription for ${user.firstName}`);
                notification.status = 'failed';
                notification.channel = 'push';
                await this.notificationRepository.save(notification);
                return;
            }
            const pushPayload = this.generatePushPayload(notification);
            const result = await webpush.sendNotification(
                JSON.parse(user.pushSubscription),
                JSON.stringify(pushPayload)
            );
            notification.status = 'sent';
            notification.sentAt = new Date();
            notification.channel = 'push';
            await this.notificationRepository.save(notification);

            console.log(`Push notification sent to ${user.firstName}`);

        } catch (error) {
            console.error(`Error sending push notification to user ${user.id}:`, error);
            notification.status = 'failed';
            notification.channel = 'push';
            await this.notificationRepository.save(notification);
        }
    }
    generatePushPayload(notification) {
        const basePayload = {
            title: notification.title,
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: {
                notificationId: notification.id,
                type: notification.type,
                url: this.getNotificationUrl(notification.type),
                ...notification.data
            },
            actions: []
        };
        if (notification.type === 'outfit_suggestion') {
            basePayload.actions = [
                {
                    action: 'view',
                    title: 'View Outfits',
                    icon: '/icons/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/icons/dismiss-icon.png'
                }
            ];
            if (notification.data.recommendations && notification.data.recommendations.length > 0) {
                const firstOutfit = notification.data.recommendations[0];
                if (firstOutfit.outfitSuggestion && firstOutfit.outfitSuggestion.items.length > 0) {
                    basePayload.body += `\n\nTop suggestion: ${firstOutfit.outfitSuggestion.name || 'Custom Outfit'}`;
                }
            }
        }
        if (notification.type === 'rfid_alert') {
            basePayload.actions = [
                {
                    action: 'view_outfit',
                    title: 'See Outfit',
                    icon: '/icons/outfit-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Not Now',
                    icon: '/icons/dismiss-icon.png'
                }
            ];
        }
        return basePayload;
    }
    getNotificationUrl(type) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        switch (type) {
            case 'outfit_suggestion':
                return `${baseUrl}/recommendations.html`;
            case 'rfid_alert':
                return `${baseUrl}/recommendations.html`;
            default:
                return `${baseUrl}/dashboard.html`;
        }
    }
     async sendRfidNotification(userId, itemId) {
        try {
            console.log(`RFID trigger for user ${userId}, item ${itemId}`);

            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'firstName', 'enableRecommendations', 'pushSubscription']
            });

            if (!user || !user.enableRecommendations) {
                console.log('RFID notifications disabled for user');
                return { success: false, message: 'Notifications disabled' };
            }
            const recommendation = await this.recommendationService.generateRfidTriggeredRecommendation(userId, itemId);
            if (!recommendation.hasRecommendation) {
                console.log('No recommendation generated for RFID trigger');
                return { success: false, message: recommendation.message };
            }
            const notification = await this.createNotification(userId, {
                type: 'rfid_alert',
                title: 'Outfit Suggestion Ready!',
                message: recommendation.message,
                data: {
                    baseItem: recommendation.baseItem,
                    recommendation: recommendation.recommendation,
                    type: 'rfid_triggered'
                }
            });
            await this.sendPushNotification(user, notification);
            console.log(`RFID notification sent to ${user.firstName}`);
            return { 
                success: true, 
                notification,
                recommendation: recommendation.recommendation 
            };

        } catch (error) {
            console.error('Error sending RFID notification:', error);
            return { success: false, error: error.message };
        }
    }
    async subscribeToPush(userId, subscription) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }

            user.pushSubscription = JSON.stringify(subscription);
            await this.userRepository.save(user);

            console.log(`Push subscription saved for user ${userId}`);
            return { success: true };

        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return { success: false, error: error.message };
        }
    }
    async unsubscribeFromPush(userId) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }

            user.pushSubscription = null;
            await this.userRepository.save(user);

            console.log(`Push subscription removed for user ${userId}`);
            return { success: true };

        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return { success: false, error: error.message };
        }
    }
    async getUserNotificationSettings(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: [
                    'enableRecommendations',
                    'enableWeatherNotifications', 
                    'enableOutfitReminders'
                ]
            });
            return {
                pushOutfitReminders: user?.enableOutfitReminders ?? true,
                pushRFIDAlerts: user?.enableRecommendations ?? true,
                pushWeatherAlerts: user?.enableWeatherNotifications ?? false
            };
        } catch (error) {
            console.error('Error getting user notification settings:', error);
            return {
                pushOutfitReminders: false,
                pushRFIDAlerts: false,
                pushWeatherAlerts: false
            };
        }
    }
    async getUserNotifications(userId, limit = 20) {
        try {
            return await this.notificationRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: limit
            });
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            return [];
        }
    }
    async markAsRead(userId, notificationId) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId, userId }
            });

            if (!notification) {
                return { success: false, message: 'Notification not found' };
            }

            notification.readAt = new Date();
            await this.notificationRepository.save(notification);

            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    async getWeatherData(location=null) {
       if (!location) {
            // Default location or get from user
            return {
                temperature: 20,
                condition: 'partly cloudy',
                humidity: 65,
                windSpeed: 10
            };
        }

        try {
            const weather = await this.weatherService.getCurrentWeather(location);
            return {
                temperature: weather.temperature,
                condition: weather.condition,
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                location: weather.location,
                description: weather.description
            };
        } catch (error) {
            console.warn('Weather fetch failed in notification:', error.message);
            return {
                temperature: 20,
                condition: 'partly cloudy',
                humidity: 65,
                windSpeed: 10
            };
        }
    }
    @Cron(CronExpression.EVERY_WEEK)
    async cleanupOldNotifications() {
        try {
            console.log('Cleaning up old notifications');
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await this.notificationRepository.delete({
                createdAt: { $lt: thirtyDaysAgo },
                status: 'sent'
            });

            console.log(`Cleaned up ${result.affected || 0} old notifications`);
        } catch (error) {
            console.error('Error cleaning up notifications:', error);
        }
    }
}