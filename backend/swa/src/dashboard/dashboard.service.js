import { Injectable, Dependencies,Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';
import { User } from '../user/entities/user.entity.js';
import {AnalyticsService} from '../analytics/analytics.service.js';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(Outfit) outfitRepository,
        @InjectRepository(User) userRepository,
        @Inject(AnalyticsService) analyticsService
    ) {
        this.itemRepository = itemRepository;
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }

    async getDashboardData(userId)
    {
        const [stats,recentActivity,todaysOutfit,quickActions]=await Promise.all([
            this.getWardrobeStats(userId),
            this.getRecentActivity(userId),
            this.getTodaysOutfit(userId),
            this.getQuickActions(userId)
        ]);
        return{
            stats,
            recentActivity,
            todaysOutfit,
            quickActions,
            user:await this.getUserGreeting(userId)
        };
    }
    async getRecentActivity(userId) {
        try {
            // Fetch the 5 most recent outfits created by the user
            const recentOutfits = await this.outfitRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: 5,
                select: ['id', 'name', 'createdAt', 'occasion'] 
            });

            return recentOutfits.map(outfit => ({
                id: outfit.id,
                name: outfit.name,
                type: 'outfit_created',
                date: outfit.createdAt,
                occasion: outfit.occasion
            }));
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    }

    async getWardrobeStats(userId)
    {
        return await this.analyticsService.getBasicWardrobeStats(userId);
    }
    //implement first analytics and import here partially showing in dashboard , a quick preview
    //but a full view in dedicated page of analytics
    async getTodaysOutfit(userId)
    {
        //for now just the recently worn but it should be an combination of scheldue service + reccomandation service + item's availability
        const todaysOutfit = await this.outfitRepository.findOne({
            where: { userId },
            order: {
                isFavorite: 'DESC',
                lastWorn: 'DESC',
                createdAt: 'DESC'
            }
        });

        if (!todaysOutfit) {
            return {
                hasOutfit: false,
                message: "No outfits created yet. Create your first outfit!",
                suggestedAction: "create_outfit"
            };
        }

        // Check availability
        const availability = await this.checkOutfitAvailability(userId, todaysOutfit.items);

        return {
            hasOutfit: true,
            outfit: {
                id: todaysOutfit.id,
                name: todaysOutfit.name,
                occasion: todaysOutfit.occasion,
                items: todaysOutfit.items,
                isAvailable: availability.isAvailable,
                unavailableItems: availability.unavailableItems
            },
            weather: {
                temp: "--",
                condition: "Loading...",
                icon: "bi-cloud-sun"
            }
        };
    }
    async getQuickActions(userId) {
        const itemsNeedingAttention = await this.itemRepository.count({
            where: { userId, location: 'laundry' }
        });

        const uncompletedProfile = await this.checkProfileCompletion(userId);

        return {
            itemsInLaundry: itemsNeedingAttention,
            profileIncomplete: uncompletedProfile,
            suggestions: [
                "Add seasonal items for winter",
                "Create outfits for upcoming events",
                "Update item locations after laundry"
            ]
        };
    }
    async getUserGreeting(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['firstName', 'lastName', 'profilePicture']
        });

        const hour = new Date().getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        else if (hour >= 17) greeting = 'Good evening';

        return {
            firstName: user?.firstName || 'User',
            greeting,
            profilePicture: user?.profilePicture
        };
    }
    async countAvailableOutfits(userId) {
        const outfits = await this.outfitRepository.find({ 
            where: { userId },
            select: ['id', 'items']
        });

        let availableCount = 0;
        for (const outfit of outfits) {
            const availability = await this.checkOutfitAvailability(userId, outfit.items);
            if (availability.isAvailable) availableCount++;
        }

        return availableCount;
    }
    async checkOutfitAvailability(userId, itemRefs) {
        if (!itemRefs || itemRefs.length === 0) {
            return { isAvailable: false, unavailableItems: [] };
        }

        const itemIds = itemRefs.map(ref => ref.id);
        const items = await this.itemRepository.find({
            where: { id: itemIds, userId },
            select: ['id', 'name', 'location']
        });

        const unavailableItems = items.filter(item => 
            item.location === 'worn' || 
            item.location === 'laundry' || 
            item.location === 'dry-cleaning'
        );

        return {
            isAvailable: unavailableItems.length === 0,
            unavailableItems: unavailableItems.map(item => ({
                id: item.id,
                name: item.name,
                location: item.location
            }))
        };
    }
    async checkProfileCompletion(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['profileSetupCompleted', 'primarySize', 'skinTone', 'location']
        });

        return !user?.profileSetupCompleted || 
               !user?.primarySize || 
               !user?.skinTone || 
               !user?.location;
    }
}