import { Injectable, Dependencies, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity.js';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';
import { User } from '../user/entities/user.entity.js';

@Injectable()
@Dependencies('RecommendationRepository', 'ItemRepository', 'OutfitRepository', 'UserRepository')
export class RecommendationService {
    constructor(
        @InjectRepository(Recommendation) recommendationRepository,
        @InjectRepository(Item) itemRepository,
        @InjectRepository(Outfit) outfitRepository,
        @InjectRepository(User) userRepository
    ) {
        this.recommendationRepository = recommendationRepository;
        this.itemRepository = itemRepository;
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
    }

    async generateScheduledRecommendations(userId, occasion = 'any', weatherData = null) {
        try {
            const recommendations = await this.generateOutfitRecommendations(userId, {
                type: 'scheduled',
                occasion,
                weatherData
            });
            const savedRecommendations = [];
            for (const rec of recommendations) {
                const recommendation = this.recommendationRepository.create({
                    userId,
                    type: 'scheduled',
                    occasion,
                    outfitSuggestion: rec.outfit,
                    weatherData,
                    confidenceScore: rec.score,
                    reasoning: rec.reasoning
                });
                savedRecommendations.push(await this.recommendationRepository.save(recommendation));
            }

            return {
                recommendations: savedRecommendations,
                count: savedRecommendations.length,
                occasion,
                generatedAt: new Date()
            };
        } catch (error) {
            throw new BadRequestException('Failed to generate scheduled recommendations');
        }
    }

    async generateRfidTriggeredRecommendation(userId, baseItemId) {
        try {
            const baseItem = await this.itemRepository.findOne({
                where: { id: baseItemId, userId },
                select: ['id', 'name', 'category', 'color', 'season', 'location']
            });

            if (!baseItem) {
                throw new BadRequestException('Base item not found');
            }

            if (baseItem.location !== 'wardrobe') {
                return {
                    hasRecommendation: false,
                    message: `${baseItem.name} is currently ${baseItem.location}. Cannot create outfit.`,
                    baseItem
                };
            }

            const outfitSuggestion = await this.buildOutfitAroundItem(userId, baseItem);

            if (!outfitSuggestion) {
                return {
                    hasRecommendation: false,
                    message: `No suitable items found to create an outfit with ${baseItem.name}`,
                    baseItem
                };
            }

            const recommendation = this.recommendationRepository.create({
                userId,
                type: 'rfid-triggered',
                occasion: outfitSuggestion.occasion,
                outfitSuggestion: outfitSuggestion.outfit,
                confidenceScore: outfitSuggestion.score,
                reasoning: outfitSuggestion.reasoning
            });

            const saved = await this.recommendationRepository.save(recommendation);

            return {
                hasRecommendation: true,
                recommendation: saved,
                baseItem,
                message: `Great choice! Here's an outfit suggestion with ${baseItem.name}`
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to generate RFID recommendation');
        }
    }

    async generateOutfitRecommendations(userId, criteria = {}) {
        try {
            const { occasion = 'any', weatherData = null, type = 'manual' } = criteria;

            const availableItems = await this.getAvailableItems(userId);
            
            if (availableItems.length < 3) {
                return [{
                    outfit: { items: [], name: 'No outfit available' },
                    score: 0,
                    reasoning: { main: 'Not enough available items in wardrobe' }
                }];
            }
            const userPreferences = await this.getUserPreferences(userId);
            const outfitCombinations = this.generateOutfitCombinations(availableItems, occasion);
            const scoredOutfits = outfitCombinations.map(outfit => ({
                outfit,
                score: this.scoreOutfit(outfit, userPreferences, weatherData, occasion),
                reasoning: this.generateReasoning(outfit, weatherData, occasion)
            }));
            return scoredOutfits
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
        } catch (error) {
            throw new BadRequestException('Failed to generate outfit recommendations');
        }
    }

    async getTodaysRecommendations(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const existingRecommendations = await this.recommendationRepository.find({
                where: {
                    userId,
                    createdAt: { $gte: today, $lt: tomorrow }
                },
                order: { confidenceScore: 'DESC' },
                take: 3
            });
            if (existingRecommendations.length > 0) {
                return {
                    hasRecommendations: true,
                    recommendations: existingRecommendations,
                    isGenerated: true
                };
            }
            const newRecommendations = await this.generateScheduledRecommendations(userId, 'any');
            return {
                hasRecommendations: newRecommendations.count > 0,
                recommendations: newRecommendations.recommendations,
                isGenerated: false
            };
        } catch (error) {
            throw new BadRequestException('Failed to get today\'s recommendations');
        }
    }

    async updateRecommendationFeedback(userId, recommendationId, feedback) {
        try {
            const recommendation = await this.recommendationRepository.findOne({
                where: { id: recommendationId, userId }
            });
            if (!recommendation) {
                throw new BadRequestException('Recommendation not found');
            }
            recommendation.wasViewed = true;
            recommendation.viewedAt = new Date();
            if (feedback.accepted) {
                recommendation.wasAccepted = true;
                recommendation.acceptedAt = new Date();
            }
            return await this.recommendationRepository.save(recommendation);
        } catch (error) {
            throw new BadRequestException('Failed to update recommendation feedback');
        }
    }

    
    async getAvailableItems(userId) {
        return await this.itemRepository.find({
            where: {
                userId,
                location: 'wardrobe' 
            },
            select: ['id', 'name', 'category', 'color', 'season', 'imageUrl', 'wearCount']
        });
    }

    async getUserPreferences(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['stylePreferences', 'colorPreferences', 'preferredBrands']
        });

        return {
            styles: user?.stylePreferences || [],
            colors: user?.colorPreferences || [],
            brands: user?.preferredBrands || []
        };
    }

    generateOutfitCombinations(items, occasion) {
        const outfits = [];
        const itemsByCategory = this.groupItemsByCategory(items);
        const templates = this.getOutfitTemplates(occasion);
        templates.forEach((template, index) => {
            const outfit = this.buildOutfitFromTemplate(template, itemsByCategory);
            if (outfit && outfit.items.length >= 3) {
                outfit.name = `${template.name} ${index + 1}`;
                outfit.occasion = occasion;
                outfits.push(outfit);
            }
        });

        return outfits.slice(0, 5); 
    }
    groupItemsByCategory(items) {
        return items.reduce((groups, item) => {
            const category = item.category;
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
            return groups;
        }, {});
    }

    getOutfitTemplates(occasion) {
        const templates = {
            work: [
                { name: 'Business Casual', categories: ['tops', 'bottoms', 'shoes'], style: 'professional' },
                { name: 'Smart Casual', categories: ['tops', 'bottoms', 'outerwear', 'shoes'], style: 'business' }
            ],
            casual: [
                { name: 'Everyday Casual', categories: ['tops', 'bottoms', 'shoes'], style: 'relaxed' },
                { name: 'Weekend Vibes', categories: ['tops', 'bottoms', 'accessories', 'shoes'], style: 'comfortable' }
            ],
            formal: [
                { name: 'Formal Event', categories: ['tops', 'bottoms', 'outerwear', 'shoes'], style: 'elegant' }
            ],
            sport: [
                { name: 'Workout Ready', categories: ['tops', 'bottoms', 'shoes'], style: 'athletic' }
            ],
            any: [
                { name: 'Versatile Look', categories: ['tops', 'bottoms', 'shoes'], style: 'adaptive' },
                { name: 'Comfortable Style', categories: ['tops', 'bottoms', 'accessories'], style: 'easy' }
            ]
        };
        return templates[occasion] || templates.any;
    }

    buildOutfitFromTemplate(template, itemsByCategory) {
        const outfit = {
            name: template.name,
            items: [],
            style: template.style
        };

        for (const category of template.categories) {
            const availableItems = itemsByCategory[category];
            if (availableItems && availableItems.length > 0) {
                const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                outfit.items.push({
                    id: randomItem.id,
                    name: randomItem.name,
                    category: randomItem.category,
                    color: randomItem.color,
                    imageUrl: randomItem.imageUrl
                });
            }
        }

        return outfit.items.length >= 2 ? outfit : null;
    }

    async buildOutfitAroundItem(userId, baseItem) {
        const availableItems = await this.getAvailableItems(userId);
        const otherItems = availableItems.filter(item => item.id !== baseItem.id);

        if (otherItems.length < 2) {
            return null;
        }
        const itemsByCategory = this.groupItemsByCategory(otherItems);
        const outfit = {
            name: `Outfit with ${baseItem.name}`,
            items: [{
                id: baseItem.id,
                name: baseItem.name,
                category: baseItem.category,
                color: baseItem.color,
                imageUrl: baseItem.imageUrl
            }],
            occasion: this.inferOccasionFromItem(baseItem)
        };
        const neededCategories = this.getComplementaryCategories(baseItem.category);
        for (const category of neededCategories) {
            const availableInCategory = itemsByCategory[category];
            if (availableInCategory && availableInCategory.length > 0) {
                const bestMatch = this.findBestMatchingItem(baseItem, availableInCategory);
                if (bestMatch) {
                    outfit.items.push({
                        id: bestMatch.id,
                        name: bestMatch.name,
                        category: bestMatch.category,
                        color: bestMatch.color,
                        imageUrl: bestMatch.imageUrl
                    });
                }
            }
        }
        if (outfit.items.length >= 3) {
            return {
                outfit,
                score: this.scoreOutfit(outfit, {}, null, outfit.occasion),
                reasoning: { main: `Built around your ${baseItem.name}` }
            };
        }

        return null;
    }

    scoreOutfit(outfit, userPreferences, weatherData, occasion) {
        let score = 50; // Base score
        score += this.scoreColorCoordination(outfit.items) * 30;
        score += this.scoreOccasionMatch(outfit, occasion) * 25;
        score += this.scoreUserPreferences(outfit, userPreferences) * 20;
        if (weatherData) {
            score += this.scoreWeatherMatch(outfit, weatherData) * 15;
        } else {
            score += 10;
        }
        score += this.scoreItemPopularity(outfit.items) * 10;
        return Math.min(100, Math.max(0, score));
    }

    generateReasoning(outfit, weatherData, occasion) {
        const reasons = [];
        reasons.push(`Perfect for ${occasion} occasions`);
        if (weatherData) {
            reasons.push(`Suitable for ${weatherData.condition} weather`);
        }

        const colors = outfit.items.map(item => item.color).filter(Boolean);
        if (colors.length > 1) {
            reasons.push(`Great color coordination with ${colors.join(', ')}`);
        }

        return {
            main: reasons[0],
            additional: reasons.slice(1)
        };
    }

    scoreColorCoordination(items) {
        const colors = items.map(item => item.color).filter(Boolean);
        if (colors.length <= 1) return 0.8;
        const neutralColors = ['black', 'white', 'gray', 'beige', 'navy'];
        const hasNeutral = colors.some(color => neutralColors.includes(color.toLowerCase()));
        
        return hasNeutral ? 0.9 : 0.6;
    }

    scoreOccasionMatch(outfit, occasion) {
        const formalCategories = ['blazer', 'dress-shirt', 'slacks'];
        const casualCategories = ['t-shirt', 'jeans', 'sneakers'];
        
        if (occasion === 'formal') {
            return outfit.items.some(item => 
                formalCategories.includes(item.category.toLowerCase())
            ) ? 1.0 : 0.3;
        }
        
        if (occasion === 'casual') {
            return outfit.items.some(item => 
                casualCategories.includes(item.category.toLowerCase())
            ) ? 1.0 : 0.7;
        }
        
        return 0.8; // Default for 'any' or 'work'
    }

    scoreUserPreferences(outfit, preferences) {
        let score = 0.5;
        if (preferences.colors && preferences.colors.length > 0) {
            const outfitColors = outfit.items.map(item => item.color).filter(Boolean);
            const hasPreferredColor = outfitColors.some(color => 
                preferences.colors.includes(color)
            );
            if (hasPreferredColor) score += 0.3;
        }
        
        return Math.min(1.0, score);
    }

    scoreWeatherMatch(outfit, weatherData) {
        if (!weatherData || !weatherData.temperature) return 0.5;
        const temp = weatherData.temperature;
        const hasOuterwear = outfit.items.some(item => item.category === 'outerwear');
        
        if (temp < 15 && hasOuterwear) return 1.0;
        if (temp > 25 && !hasOuterwear) return 1.0;
        
        return 0.7;
    }

    scoreItemPopularity(items) {
        const avgWearCount = items.reduce((sum, item) => sum + (item.wearCount || 0), 0) / items.length;
        
        if (avgWearCount >= 5 && avgWearCount <= 15) return 1.0;
        if (avgWearCount < 5) return 0.8;
        return 0.6;
    }

    inferOccasionFromItem(item) {
        const category = item.category.toLowerCase();
        const name = item.name.toLowerCase();
        
        if (name.includes('formal') || name.includes('dress') || category === 'suit') return 'formal';
        if (name.includes('sport') || name.includes('athletic') || name.includes('gym')) return 'sport';
        if (name.includes('work') || name.includes('business') || category === 'blazer') return 'work';
        
        return 'casual';
    }

    getComplementaryCategories(baseCategory) {
        const complements = {
            'tops': ['bottoms', 'shoes', 'accessories'],
            'bottoms': ['tops', 'shoes', 'outerwear'],
            'shoes': ['tops', 'bottoms'],
            'outerwear': ['tops', 'bottoms', 'shoes'],
            'accessories': ['tops', 'bottoms', 'shoes']
        };
        
        return complements[baseCategory] || ['tops', 'bottoms', 'shoes'];
    }

    findBestMatchingItem(baseItem, availableItems) {
        const neutralColors = ['black', 'white', 'gray', 'beige', 'navy'];
        
        const neutralItems = availableItems.filter(item => 
            neutralColors.includes(item.color?.toLowerCase())
        );
        
        if (neutralItems.length > 0) {
            return neutralItems[0];
        }
        
        return availableItems[0];
    }

    async getRecommendationStats(userId) {
        try {
            const totalRecommendations = await this.recommendationRepository.count({ where: { userId } });
            const acceptedRecommendations = await this.recommendationRepository.count({ 
                where: { userId, wasAccepted: true } 
            });
            const viewedRecommendations = await this.recommendationRepository.count({ 
                where: { userId, wasViewed: true } 
            });

            const acceptanceRate = totalRecommendations > 0 ? 
                ((acceptedRecommendations / totalRecommendations) * 100).toFixed(1) : 0;

            return {
                totalRecommendations,
                acceptedRecommendations,
                viewedRecommendations,
                acceptanceRate
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch recommendation statistics');
        }
    }
}