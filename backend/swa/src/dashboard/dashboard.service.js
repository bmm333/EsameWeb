import { Injectable, Dependencies } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';

@Injectable()
@Dependencies('ItemRepository', 'OutfitRepository')
export class DashboardService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(Outfit) outfitRepository
    ) {
        this.itemRepository = itemRepository;
        this.outfitRepository = outfitRepository;
    }

    async getStats(userId) {
        try {
            const [totalItems, totalOutfits, availableItems, wornItems] = await Promise.all([
                this.itemRepository.count({ where: { userId } }),
                this.outfitRepository.count({ where: { userId } }),
                this.itemRepository.count({ where: { userId, location: 'wardrobe' } }),
                this.itemRepository.count({ where: { userId, location: 'being_worn' } })
            ]);

            return {
                totalItems,
                totalOutfits,
                availableItems,
                wornItems
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    async getTodaysOutfit(userId) {
        try {
            const recentOutfit = await this.outfitRepository.findOne({
                where: { userId },
                order: { updatedAt: 'DESC' }
            });

            if (!recentOutfit || !recentOutfit.items || recentOutfit.items.length === 0) {
                return {
                    hasOutfit: false,
                    message: 'No outfits created yet. Create your first outfit!'
                };
            }
            const availability = await this.checkOutfitAvailability(userId, recentOutfit.items);
            return {
                hasOutfit: true,
                outfit: {
                    ...recentOutfit,
                    isAvailable: availability.isAvailable,
                    availableItems: availability.availableItems,
                    unavailableItems: availability.unavailableItems
                }
            };
        } catch (error) {
            console.error('Error getting today\'s outfit:', error);
            return {
                hasOutfit: false,
                message: 'Error loading outfit suggestions'
            };
        }
    }

    async getRecentActivity(userId) {
        try {
            const recentItems = await this.itemRepository.find({
                where: { userId },
                order: { dateAdded: 'DESC' },
                take: 5,
                select: ['id', 'name', 'category', 'dateAdded']
            });
            const activities = recentItems.map(item => ({
                id: item.id,
                message: `Added ${item.name} to ${item.category}`,
                type: 'item_added',
                date: item.dateAdded,
                icon: 'plus-circle'
            }));
            console.log('Response data:', activities);
            return activities;
        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw error;
        }
    }
    async checkOutfitAvailability(userId, itemRefs) {
        try {
            if (!itemRefs || itemRefs.length === 0) {
                return {
                    isAvailable: true,
                    availableItems: [],
                    unavailableItems: []
                };
            }

            const itemIds = itemRefs.map(ref => ref.id);
            console.log('Checking availability for item IDs:', itemIds);
            
            const items = await this.itemRepository.find({
                where: { 
                    id: In(itemIds),
                    userId 
                },
                select: ['id', 'name', 'location']
            });
            console.log('Found items:', items);
            const availableItems = items.filter(item => 
                item.location === 'wardrobe' || item.location === 'clean'
            );
            const unavailableItems = items.filter(item => 
                item.location === 'being_worn' || item.location === 'laundry' || item.location === 'dry-cleaning'
            );
            return {
                isAvailable: unavailableItems.length === 0,
                availableItems: availableItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    location: item.location
                })),
                unavailableItems: unavailableItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    location: item.location
                }))
            };
        } catch (error) {
            console.error('Error checking outfit availability:', error);
            throw error;
        }
    }
}