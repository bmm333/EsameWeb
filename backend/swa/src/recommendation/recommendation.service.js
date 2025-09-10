import { Injectable, Dependencies, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity.js';
import { Item } from '../item/entities/item.entity.js';

@Injectable()
@Dependencies('RecommendationRepository', 'ItemRepository')
export class RecommendationService {
    constructor(
        @InjectRepository(Recommendation) recommendationRepository,
        @InjectRepository(Item) itemRepository
    ) {
        this.recommendationRepository = recommendationRepository;
        this.itemRepository = itemRepository;
    }

    async generateRecommendations(userId, preferences = {}) {
        try {
            await this.recommendationRepository.delete({ userId });
            
            const userItems = await this.itemRepository.find({
                where: { userId },
                order: { lastWorn: 'ASC' }
            });

            if (userItems.length < 2) {
                return [];
            }

            const itemsByCategory = this.groupItemsByCategory(userItems);
            const allRecommendations = this.generateOutfitCombinations(
                itemsByCategory, 
                preferences.occasion, 
                preferences.weather
            );

            const uniqueRecommendations = this.deduplicateRecommendations(allRecommendations);
            const limit = preferences.limit || 6;
            const limitedRecommendations = uniqueRecommendations.slice(0, limit);

            const savedRecommendations = [];
            for (const rec of limitedRecommendations) {
                try {
                    const recommendation = this.recommendationRepository.create({
                        userId,
                        title: rec.title,
                        occasion: preferences.occasion || '',
                        wasWorn: false,
                        reason: rec.reason || 'Personalized recommendation'
                    });

                    const itemEntities = await this.itemRepository.findByIds(
                        rec.items.map(item => item.id)
                    );
                    
                    if (itemEntities.length !== rec.items.length) {
                        continue;
                    }
                    
                    recommendation.items = itemEntities;
                    const saved = await this.recommendationRepository.save(recommendation);

                    const completeRec = await this.recommendationRepository.findOne({
                        where: { id: saved.id },
                        relations: ['items'],
                        select: {
                            id: true,
                            userId: true,
                            title: true,
                            occasion: true,
                            imageUrl: true,
                            wasWorn: true,
                            wornAt: true,
                            reason: true,
                            createdAt: true
                        }
                    });
                    
                    if (completeRec) {
                        savedRecommendations.push(completeRec);
                    }
                    
                } catch (saveError) {
                    continue;
                }
            }

            return savedRecommendations;
            
        } catch (error) {
            throw error;
        }
    }

    async getRecommendations(userId, filters = {}) {
        const query = this.recommendationRepository
            .createQueryBuilder('r')
            .leftJoin('r.items', 'i')
            .where('r.userId = :userId', { userId })
            .andWhere('r.rejectedAt IS NULL')
            .select([
                'r.id', 'r.title', 'r.occasion', 'r.wasWorn', 'r.createdAt',
                'i.id', 'i.name', 'i.category', 'i.imageUrl'
            ])
            .orderBy('r.createdAt', 'DESC');

        if (filters.occasion) {
            query.andWhere('r.occasion = :occasion', { occasion: filters.occasion });
        }

        return await query.getMany();
    }

    async getRecommendationHistory(userId) {
        return await this.recommendationRepository.find({
            where: { userId },
            relations: ['items'],
            order: { createdAt: 'DESC' }
        });
    }

    async markAsWorn(userId, recommendationId) {
        const recommendation = await this.recommendationRepository.findOne({
            where: { id: recommendationId, userId },
            relations: ['items']
        });

        if (!recommendation) {
            throw new NotFoundException('Recommendation not found');
        }

        recommendation.wasWorn = true;
        recommendation.wornAt = new Date();

        for (const item of recommendation.items) {
            item.wearCount = (item.wearCount || 0) + 1;
            item.lastWorn = new Date();
            item.location = 'being_worn';
            await this.itemRepository.save(item);
        }

        return await this.recommendationRepository.save(recommendation);
    }

    async saveRecommendation(userId, recommendationData) {
        const recommendation = this.recommendationRepository.create({
            ...recommendationData,
            userId,
            createdAt: new Date()
        });

        return await this.recommendationRepository.save(recommendation);
    }

    async deleteRecommendation(userId, recommendationId) {
        const recommendation = await this.recommendationRepository.findOne({
            where: { id: recommendationId, userId }
        });

        if (!recommendation) {
            throw new NotFoundException('Recommendation not found');
        }

        await this.recommendationRepository.remove(recommendation);
        return { success: true, message: 'Recommendation deleted' };
    }

    async rejectRecommendation(userId, recommendationId, reason = null) {
        try {
            const recommendation = await this.recommendationRepository.findOne({
                where: { id: recommendationId, userId }
            });

            if (!recommendation) {
                throw new Error('Recommendation not found');
            }

            recommendation.rejectedAt = new Date();
            recommendation.rejectionReason = reason;

            await this.recommendationRepository.save(recommendation);
            
            return { success: true, message: 'Recommendation rejected' };
        } catch (error) {
            throw error;
        }
    }

    deduplicateRecommendations(recommendations) {
        const uniqueRecommendations = [];
        const seenCombinations = new Set();

        for (const rec of recommendations) {
            const combinationKey = rec.items
                .map(item => item.id)
                .sort((a, b) => a - b)
                .join('-');
            
            if (!seenCombinations.has(combinationKey)) {
                seenCombinations.add(combinationKey);
                uniqueRecommendations.push(rec);
            }
        }

        return uniqueRecommendations;
    }

    groupItemsByCategory(items) {
        const groups = {
            tops: [],
            bottoms: [],
            shoes: [],
            outerwear: [],
            accessories: [],
            dresses: []
        };

        items.forEach(item => {
            if (groups[item.category]) {
                groups[item.category].push(item);
            }
        });

        return groups;
    }

    generateOutfitCombinations(itemsByCategory, occasion, weather) {
        const outfits = [];
        const usedCombinations = new Set();

        const filterByOccasion = (items) => {
            if (!occasion) return items;
            return items.filter(item => !item.occasion || item.occasion === occasion);
        };

        const tops = filterByOccasion(itemsByCategory.tops);
        const bottoms = filterByOccasion(itemsByCategory.bottoms);
        const shoes = filterByOccasion(itemsByCategory.shoes);
        const outerwear = filterByOccasion(itemsByCategory.outerwear);
        const dresses = filterByOccasion(itemsByCategory.dresses);

        dresses.forEach(dress => {
            const outfitItems = [dress];
            if (shoes.length > 0) {
                outfitItems.push(this.selectRandomItem(shoes));
            }
            if (weather === 'cool' && outerwear.length > 0) {
                outfitItems.push(this.selectRandomItem(outerwear));
            }
            
            const combinationKey = outfitItems.map(item => item.id).sort().join('-');
            if (!usedCombinations.has(combinationKey)) {
                usedCombinations.add(combinationKey);
                outfits.push({
                    items: outfitItems,
                    title: `${dress.name}`,
                    reason: this.generateReason(occasion, weather),
                    occasion
                });
            }
        });

        const maxTopBottomCombinations = 8;
        let combinationCount = 0;
        
        for (const top of tops) {
            for (const bottom of bottoms) {
                if (combinationCount >= maxTopBottomCombinations) break;
                
                const outfitItems = [top, bottom];
                if (shoes.length > 0) {
                    outfitItems.push(this.selectRandomItem(shoes));
                }
                if ((weather === 'cool' || occasion === 'formal') && outerwear.length > 0) {
                    outfitItems.push(this.selectRandomItem(outerwear));
                }
                
                const combinationKey = outfitItems.map(item => item.id).sort().join('-');
                if (!usedCombinations.has(combinationKey)) {
                    usedCombinations.add(combinationKey);
                    outfits.push({
                        items: outfitItems,
                        title: `${top.name} + ${bottom.name}`,
                        reason: this.generateReason(occasion, weather),
                        occasion
                    });
                    combinationCount++;
                }
            }
            if (combinationCount >= maxTopBottomCombinations) break;
        }

        return outfits.sort((a, b) => {
            const aLastWorn = Math.min(...a.items.map(item => item.lastWorn ? new Date(item.lastWorn).getTime() : 0));
            const bLastWorn = Math.min(...b.items.map(item => item.lastWorn ? new Date(item.lastWorn).getTime() : 0));
            return aLastWorn - bLastWorn;
        });
    }

    selectRandomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    generateReason(occasion, weather) {
        const reasons = [];
        
        if (occasion) {
            switch (occasion) {
                case 'formal':
                    reasons.push('Perfect for formal events');
                    break;
                case 'casual':
                    reasons.push('Great for casual outings');
                    break;
                case 'sporty':
                    reasons.push('Ideal for active days');
                    break;
                default:
                    reasons.push(`Suitable for ${occasion} occasions`);
            }
        }
        
        if (weather) {
            switch (weather) {
                case 'hot':
                    reasons.push('Light and breathable for hot weather');
                    break;
                case 'cool':
                    reasons.push('Layered for cooler temperatures');
                    break;
                case 'rainy':
                    reasons.push('Weather-appropriate choices');
                    break;
            }
        }
        
        if (reasons.length === 0) {
            reasons.push('Based on your wardrobe preferences');
        }
        
        return reasons.join(' • ');
    }
}