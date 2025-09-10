import { Injectable, Dependencies, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; 
import { Outfit } from './entities/outfit.entity.js';
import { Item } from '../item/entities/item.entity.js';

@Injectable()
@Dependencies('OutfitRepository', 'ItemRepository')
export class OutfitService {
    constructor(
        @InjectRepository(Outfit) outfitRepository,
        @InjectRepository(Item) itemRepository
    ) {
        this.outfitRepository = outfitRepository;
        this.itemRepository = itemRepository;
    }

    async createOutfit(userId, createOutfitDto) {
        try {
            const itemIds = createOutfitDto.itemIds;
            console.log('Looking for items with IDs:', itemIds);
            const items = await this.itemRepository.find({
                where: { 
                    id: In(itemIds),
                    userId 
                },
                select: ['id', 'name', 'category', 'imageUrl']
            });
            if (items.length !== itemIds.length) {
                const foundIds = items.map(item => item.id);
                const missingIds = itemIds.filter(id => !foundIds.includes(id));
                console.log('Missing item IDs:', missingIds);
                throw new BadRequestException(`Items not found: ${missingIds.join(', ')}`);
            }
            const outfit = this.outfitRepository.create({
                name: createOutfitDto.name,
                occasion: createOutfitDto.occasion,
                notes: createOutfitDto.notes,
                userId,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    imageUrl: item.imageUrl
                })),
                isFavorite: false,
                wearCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedOutfit = await this.outfitRepository.save(outfit);
            return savedOutfit;
        } catch (error) {
            console.error('Error in createOutfit:', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create outfit: ' + error.message);
        }
    }

    async getAllOutfits(userId, filters = {}) {
        try {
            const query = this.outfitRepository.createQueryBuilder('outfit')
                .where('outfit.userId = :userId', { userId })
                .orderBy('outfit.updatedAt', 'DESC');

            if (filters.occasion) {
                query.andWhere('outfit.occasion = :occasion', { occasion: filters.occasion });
            }
            if (filters.season) {
                query.andWhere('outfit.season = :season', { season: filters.season });
            }
            if (filters.isFavorite !== undefined) {
                query.andWhere('outfit.isFavorite = :isFavorite', { isFavorite: filters.isFavorite });
            }
            if (filters.search) {
                query.andWhere('outfit.name ILIKE :search', { search: `%${filters.search}%` });
            }
            const outfits = await query.getMany();
            
            return await Promise.all(outfits.map(async (outfit) => {
                const availability = await this.checkOutfitAvailability(userId, outfit.items || []);
                return {
                    ...outfit,
                    isAvailable: availability.isAvailable,
                    availableItems: availability.availableItems,
                    unavailableItems: availability.unavailableItems
                };
            }));
        } catch (error) {
            console.error('Error in getAllOutfits:', error);
            throw new BadRequestException('Failed to retrieve outfits');
        }
    }

    async getOutfitById(userId, outfitId) {
        try {
            const outfit = await this.outfitRepository.findOne({
                where: { id: outfitId, userId }
            });
            
            if (!outfit) {
                throw new NotFoundException('Outfit not found');
            }
            
            const availability = await this.checkOutfitAvailability(userId, outfit.items || []);
            return {
                ...outfit,
                isAvailable: availability.isAvailable,
                availableItems: availability.availableItems,
                unavailableItems: availability.unavailableItems
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch outfit');
        }
    }

    async updateOutfit(userId, outfitId, updateOutfitDto) {
        try {
            const outfit = await this.outfitRepository.findOne({
                where: { id: outfitId, userId }
            });
            
            if (!outfit) {
                throw new NotFoundException('Outfit not found');
            }

            if (updateOutfitDto.itemIds) {
                const items = await this.itemRepository.find({
                    where: { 
                        id: In(updateOutfitDto.itemIds), 
                        userId 
                    },
                    select: ['id', 'name', 'category', 'imageUrl']
                });

                if (items.length !== updateOutfitDto.itemIds.length) {
                    throw new BadRequestException('One or more items not found or do not belong to you');
                }

                updateOutfitDto.items = items.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    imageUrl: item.imageUrl
                }));
                
                delete updateOutfitDto.itemIds;
            }

            Object.assign(outfit, updateOutfitDto);
            outfit.updatedAt = new Date();
            
            return await this.outfitRepository.save(outfit);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update outfit');
        }
    }

    async deleteOutfit(userId, outfitId) {
        try {
            const outfit = await this.outfitRepository.findOne({
                where: { id: outfitId, userId }
            });

            if (!outfit) {
                throw new NotFoundException('Outfit not found');
            }

            await this.outfitRepository.remove(outfit);
            return { message: 'Outfit deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete outfit');
        }
    }

    async toggleFavorite(userId, outfitId) {
        try {
            const outfit = await this.outfitRepository.findOne({
                where: { id: outfitId, userId }
            });

            if (!outfit) {
                throw new NotFoundException('Outfit not found');
            }

            outfit.isFavorite = !outfit.isFavorite;
            outfit.updatedAt = new Date();
            
            return await this.outfitRepository.save(outfit);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to toggle favorite');
        }
    }

    async logWear(userId, outfitId) {
        try {
            const outfit = await this.outfitRepository.findOne({
                where: { id: outfitId, userId }
            });

            if (!outfit) {
                throw new NotFoundException('Outfit not found');
            }
            outfit.wearCount = (outfit.wearCount || 0) + 1;
            outfit.lastWorn = new Date();
            outfit.updatedAt = new Date();
            
            const wearHistory = outfit.wearHistory || [];
            wearHistory.push({
                date: new Date(),
                weather: null, 
                occasion: outfit.occasion
            });
            outfit.wearHistory = wearHistory;
            if (outfit.items && outfit.items.length > 0) {
                for (const itemRef of outfit.items) {
                    const item = await this.itemRepository.findOne({
                        where: { id: itemRef.id, userId }
                    });
                    
                    if (item) {
                        item.wearCount = (item.wearCount || 0) + 1;
                        item.lastWorn = new Date();
                        
                        const itemWearHistory = item.wearHistory || [];
                        itemWearHistory.push({
                            date: new Date(),
                            outfitId: outfit.id,
                            outfitName: outfit.name
                        });
                        item.wearHistory = itemWearHistory;
                        
                        await this.itemRepository.save(item);
                    }
                }
            }
            
            return await this.outfitRepository.save(outfit);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to log outfit wear');
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
            const items = await this.itemRepository.find({
                where: { 
                    id: In(itemIds), 
                    userId 
                },
                select: ['id', 'name', 'location', 'category']
            });
            const availableItems = items.filter(item => 
                item.location === 'wardrobe' || item.location === 'clean'
            );
            const unavailableItems = items.filter(item => 
                item.location === 'worn' || item.location === 'laundry' || item.location === 'dry-cleaning'
            );
            return {
                isAvailable: unavailableItems.length === 0,
                availableItems: availableItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    location: item.location
                })),
                unavailableItems: unavailableItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    location: item.location
                }))
            };
        } catch (error) {
            console.error('Error checking outfit availability:', error);
            throw new BadRequestException('Failed to check outfit availability');
        }
    }
}