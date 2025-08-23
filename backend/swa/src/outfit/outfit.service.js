import { Injectable, Dependencies, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    async createOutfit(userId,createOutfitDto) {
        try{
            const itemIds=createOutfitDto.itemIds;
            const items=await this.itemRepository.find({
                where:{id:itemIds,userId},
                select:['id','name','category','imageUrl']
            });
            if(items.length!==itemIds.length){
                throw new BadRequestException('Some items not found');
            }
            const outfit=await this.outfitRepository.create({
                ...createOutfitDto,
                userId,
                items:items.map(item=>({
                    id:item.id,
                    name:item.name,
                    category:item.category,
                    imageUrl:item.imageUrl
                }))
            });
            return await this.outfitRepository.save(outfit);
        }
        catch(error)
        {
            if(error instanceof BadRequestException)
            {
                throw error;
            }
            throw new BadRequestException('Failed to create outfit');
        }
    }
    async getAllOutfits(userId,filters={}){
        try{
            const query=this.outfitRepository.createQueryBuilder('outfit')
            .where('outfit.userId=:userId',{userId})
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
                const availability = await this.checkOutfitAvailability(userId, outfit.items);
                return {
                    ...outfit,
                    isAvailable: availability.isAvailable,
                    availableItems: availability.availableItems,
                    unavailableItems: availability.unavailableItems
                };
         }));
        }
        catch(error)
        {
            throw new BadRequestException('Failed to retrieve outfits');
        }
    }
    async getOutfitById(userId,outfitId)
    {
        try{
            const outfit=await this.outfitRepository.findOne({
                where:{id:outfitId,userId}
            });
            if(!outfit){
                throw new NotFoundException('Outfit not found');
            }
            const availability=await this.checkOutfitAvailability(userId,outfit.items);
            return {
                ...outfit,
                isAvailable:availability.isAvailable,
                availableItems:availability.availableItems,
                unavailableItems:availability.unavailableItems
            };
        }catch(error)
        {
            if(error instanceof NotFoundException)
            {
                throw error;
            }
            throw new BadRequestException('Failed to fetch outfit');
        }
    }
    async updateOutfit(userId,outfitId,updateOutfitDto)
    {
        try{
            const outfit=await this.outfitRepository.findOne({
                where:{id:outfitId,userId}
            
            });
            if(!outfit)
            {
                throw new NotFoundException('Outfit not found');
            }
            if (updateOutfitDto.items) {
                const items = await this.itemRepository.find({
                    where: { id: updateOutfitDto.items, userId },
                    select: ['id', 'name', 'category', 'imageUrl']
                });

                if (items.length !== updateOutfitDto.items.length) {
                    throw new BadRequestException('One or more items not found or do not belong to you');
                }

                updateOutfitDto.items = items.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    imageUrl: item.imageUrl
                }));
            }

            // Update outfit
            Object.assign(outfit, updateOutfitDto);
            return await this.outfitRepository.save(outfit);
        }catch(error)
        {
            if(error instanceof NotFoundException || error instanceof BadRequestException)
            {
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

            outfit.wearCount += 1;
            outfit.lastWorn = new Date();
            
            const wearHistory = outfit.wearHistory || [];
            wearHistory.push({
                date: new Date(),
                weather: null, 
                occasion: outfit.occasion
            });
            outfit.wearHistory = wearHistory;
            for (const itemRef of outfit.items) {
                const item = await this.itemRepository.findOne({
                    where: { id: itemRef.id, userId }
                });
                
                if (item) {
                    item.wearCount += 1;
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
            const itemIds = itemRefs.map(ref => ref.id);
            const items = await this.itemRepository.find({
                where: { id: itemIds, userId },
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
            throw new BadRequestException('Failed to check outfit availability');
        }
    }
    
}
