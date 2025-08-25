import { Injectable, Dependencies, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity.js';
import { Repository, Not, IsNull } from 'typeorm';
import { RfidTag } from '../rfid/entities/rfid-tag.entity.js';
import { MediaService } from '../media/media.service.js';

@Injectable()
@Dependencies('ItemRepository', 'RfidTagRepository',MediaService)
export class ItemService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(RfidTag) rfidTagRepository,
        mediaService
    ) {
        this.itemRepository = itemRepository;
        this.rfidTagRepository = rfidTagRepository;
        this.mediaService = mediaService;
    }
    async uploadItemImage(userId,file,itemData={})
    {
        return this.mediaService.uploadImage(userId,file,{
            folder:'items',
            removeBackground:true,
            metadata:itemData
        });
    }
    async addOrUpdateItem(userId, tagId, itemData, override = false) {
        const tag = await this.rfidTagRepository.findOne({ 
            where: { tagId, userId },
            relations: ['item']
        });
        if (!tag) {
            throw new NotFoundException('RFID Tag not found');
        }
        
        if (tag.item && !override) {
            return {
                conflict: true,
                existingItem: {
                    name: tag.item.name,
                    category: tag.item.category,
                    id: tag.item.id
                }
            };
        }
        let item;
        if (tag.item && override) {
            Object.assign(tag.item, itemData);
            item = await this.itemRepository.save(tag.item);
        } else {
            item = this.itemRepository.create({
                ...itemData,
                userId,
                rfidTagId: tag.id,
                dateAdded: new Date()
            });
            item = await this.itemRepository.save(item);
            
            tag.item = item;
            await this.rfidTagRepository.save(tag);
        }
        
        return { success: true, item };
    }
    async getItemsByCategory(userId, category) {
        return this.getAllItems(userId, { category });
    }
    async getAllItems(userId, filters = {}) {
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
        if (filters.color) {
            queryBuilder.andWhere('item.color = :color', { color: filters.color });
        }

        return await queryBuilder.getMany();
    }

    async getItemByTagId(userId, tagId) {
        const item = await this.itemRepository
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.rfidTag', 'rfidTag')
            .where('rfidTag.tagId = :tagId', { tagId })
            .andWhere('item.userId = :userId', { userId })
            .getOne();
            
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        
        return item;
    }

    async updateItem(userId, tagId, itemData) {
        const item = await this.getItemByTagId(userId, tagId);     
        Object.assign(item, itemData);
        item.lastUpdated = new Date();
        
        return await this.itemRepository.save(item);
    }

    async logWear(userId, tagId) {
        const item = await this.getItemByTagId(userId, tagId);
        const wearHistory = item.wearHistory || [];
        wearHistory.push({
            date: new Date(),
            duration: null,
            occasion: null
        });
        item.wearCount = (item.wearCount || 0) + 1;
        item.lastWorn = new Date();
        item.wearHistory = wearHistory;
        item.location = 'worn';
        item.lastUpdated = new Date();
        await this.itemRepository.save(item);
        return { success: true, item };
    }
    async updateLocation(userId, tagId, location) {
        const item = await this.getItemByTagId(userId, tagId);
        item.location = location;
        item.lastLocationUpdate = new Date();
        item.lastUpdated = new Date();
        await this.itemRepository.save(item);
        return { success: true, item };
    }
    async toggleFavorite(userId, tagId) {
        const item = await this.getItemByTagId(userId, tagId);
        item.isFavorite = !item.isFavorite;
        item.lastUpdated = new Date();
        await this.itemRepository.save(item);
        return { success: true, isFavorite: item.isFavorite };
    }
    async getWearHistory(userId, tagId) {
        const item = await this.getItemByTagId(userId, tagId);
        return {
            itemName: item.name,
            wearCount: item.wearCount || 0,
            lastWorn: item.lastWorn,
            wearHistory: item.wearHistory || []
        };
    }
    async deleteItem(userId, tagId) {
        const item = await this.getItemByTagId(userId, tagId);
        if (item.imageUrl) {
            await this.deleteImageFromS3(item.imageUrl);
        }
        await this.itemRepository.remove(item);
        return { success: true, message: 'Item deleted successfully' };
    }

}