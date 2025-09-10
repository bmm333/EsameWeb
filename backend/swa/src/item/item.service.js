import { Injectable, Dependencies, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity.js';
import { RfidTag } from '../rfid/entities/rfid-tag.entity.js';
import { UserService } from '../user/user.service.js';

@Injectable()
@Dependencies('ItemRepository', 'RfidTagRepository',UserService)
export class ItemService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(RfidTag) rfidTagRepository,
        userService
    ) {
        this.itemRepository = itemRepository;
        this.rfidTagRepository = rfidTagRepository;
        this.userService = userService;
    }

    async create(userId, itemData) {
        const user = await this.userService.findOneById(userId);
        const item = this.itemRepository.create({
            ...itemData,
            userId,
            dateAdded: new Date(),
            lastUpdated: new Date(),
            wearCount: 0,
            isFavorite: false,
            location: 'wardrobe'
        });
        const savedItem = await this.itemRepository.save(item);
        if (user.subscriptionTier === 'trial') {
            await this.userService.updateUserRecord(userId, {
                trialItemsUsed: (user.trialItemsUsed || 0) + 1
            });
        }
        return savedItem;
    }

    async findAll(userId, filters = {}) {
        try {
            console.log('Finding all items for user:', userId);
            const user = await this.userService.findOneById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const queryBuilder = this.itemRepository
                .createQueryBuilder('item')
                .leftJoinAndSelect('item.rfidTag', 'rfidTag')
                .where('item.userId = :userId', { userId });
            if (filters.category) {
                queryBuilder.andWhere('item.category = :category', { category: filters.category });
            }
            if (filters.location) {
                queryBuilder.andWhere('item.location = :location', { location: filters.location });
            }
            if (filters.isFavorite === 'true') {
                queryBuilder.andWhere('item.isFavorite = :isFavorite', { isFavorite: true });
            }
            const items = await queryBuilder.orderBy('item.dateAdded', 'DESC').getMany();
            return await Promise.all(items.map(async (item) => {
                let actualLocation = item.location;
                let isAvailable = item.location === 'wardrobe';
                let lastSeen = item.lastLocationUpdate;
                if (item.rfidTag) {
                    const tag = await this.rfidTagRepository.findOne({
                        where: { id: item.rfidTag.id },
                        select: ['location', 'lastDetected', 'isActive']
                    });
                    
                    if (tag) {
                        actualLocation = tag.location;
                        isAvailable = tag.location === 'wardrobe';
                        lastSeen = tag.lastDetected || item.lastLocationUpdate;
                    }
                }
                return {
                    ...item,
                    actualLocation,
                    isAvailable,
                    lastSeen,
                    hasRfidTag: !!item.rfidTag && user.subscriptionTier !== 'trial'
                };
            }));
        } catch (error) {
            console.error('Error finding items:', error);
            throw new BadRequestException('Error retrieving items');
        }
    }
    async findOne(userId, itemId) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId, userId },
            relations: ['rfidTag']
        });
        
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        let actualLocation = item.location;
        let isAvailable = item.location === 'wardrobe';
        let lastSeen = item.lastLocationUpdate;
        if (item.rfidTag) {
            const tag = await this.rfidTagRepository.findOne({
                where: { id: item.rfidTag.id },
                select: ['location', 'lastDetected', 'isActive']
            });
            
            if (tag) {
                actualLocation = tag.location;
                isAvailable = tag.location === 'wardrobe';
                lastSeen = tag.lastDetected || item.lastLocationUpdate;
            }
        }
        return {
            ...item,
            actualLocation,
            isAvailable,
            lastSeen,
            hasRfidTag: !!item.rfidTag
        };
    }

    async update(itemId, userId, updateData) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId, userId }
        });
        
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        if (updateData.imageUrl === null) {
            item.imageUrl = null;
        } else if (updateData.imageUrl !== undefined) {
            item.imageUrl = updateData.imageUrl;
        }
        Object.keys(updateData).forEach(key => {
            if (key !== 'imageUrl' && updateData[key] !== undefined) {
                item[key] = updateData[key];
            }
        });
        item.lastUpdated = new Date();
        return await this.itemRepository.save(item);
    }
    async remove(userId, itemId) {
        const item = await this.findOne(userId, itemId);
        if (item.rfidTag) {
            item.rfidTag.itemId = null;
            await this.rfidTagRepository.save(item.rfidTag);
        }
        await this.itemRepository.remove(item);
        return { success: true, message: 'Item deleted successfully' };
    }

    async toggleFavorite(userId, itemId, isFavorite) {
        const item = await this.findOne(userId, itemId);
        item.isFavorite = isFavorite;
        item.lastUpdated = new Date();
        return this.itemRepository.save(item);
    }

    async getItemAvailability(userId, itemId) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId, userId },
            select: ['id', 'name', 'location', 'lastLocationUpdate']
        });
        return {
            itemId: item.id,
            name: item.name,
            location: item.location,
            lastSeen: item.lastLocationUpdate
        };
    }
}