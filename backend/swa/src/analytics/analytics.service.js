import { Injectable, Dependencies } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';

@Injectable()
@Dependencies('ItemRepository', 'OutfitRepository')
export class AnalyticsService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(Outfit) outfitRepository
    ) {
        this.itemRepository = itemRepository;
        this.outfitRepository = outfitRepository;
    }

    async getBasicWardrobeStats(userId) {
        try {
            const [totalItems, totalOutfits, favoriteItems] = await Promise.all([
                this.itemRepository.count({ where: { userId } }),
                this.outfitRepository.count({ where: { userId } }),
                this.itemRepository.count({ where: { userId, isFavorite: true } })
            ]);

            return {
                totalItems,
                totalOutfits,
                favoriteItems
            };
        } catch (error) {
            console.error('Error getting basic stats:', error);
            return {
                totalItems: 0,
                totalOutfits: 0,
                favoriteItems: 0
            };
        }
    }

    async getWardrobeAnalytics(userId) {
        try {
            const [
                mostWornItems,
                categoryStats,
                colorAnalysis,
                sustainabilityStats,
                rarelyUsedItems
            ] = await Promise.all([
                this.getMostWornItems(userId),
                this.getCategoryBreakdown(userId),
                this.getColorAnalysis(userId),
                this.getSustainabilityStats(userId),
                this.getRarelyUsedItems(userId)
            ]);

            return {
                mostWornItems,
                categoryStats,
                colorAnalysis,
                sustainabilityStats,
                rarelyUsedItems
            };
        } catch (error) {
            console.error('Error getting wardrobe analytics:', error);
            return {
                mostWornItems: [],
                categoryStats: [],
                colorAnalysis: {},
                sustainabilityStats: {},
                rarelyUsedItems: []
            };
        }
    }

    async getMostWornItems(userId) {
        try {
            return await this.itemRepository.find({
                where: { userId },
                order: { wearCount: 'DESC' },
                take: 10,
                select: ['id', 'name', 'category', 'imageUrl', 'wearCount', 'color']
            });
        } catch (error) {
            console.error('Error getting most worn items:', error);
            return [];
        }
    }

    async getCategoryBreakdown(userId) {
        try {
            const result = await this.itemRepository
                .createQueryBuilder('item')
                .select('item.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .addSelect('SUM(item.wearCount)', 'totalWears')
                .addSelect('AVG(item.wearCount)', 'avgWears')
                .where('item.userId = :userId', { userId })
                .groupBy('item.category')
                .getRawMany();

            return result.map(item => ({
                category: item.category,
                count: parseInt(item.count),
                totalWears: parseInt(item.totalWears) || 0,
                avgWears: parseFloat(item.avgWears) || 0
            }));
        } catch (error) {
            console.error('Error getting category breakdown:', error);
            return [];
        }
    }

    async getRarelyUsedItems(userId) {
        try {
            // Get items with low wear count
            const rarelyUsedItems = await this.itemRepository.find({
                where: { 
                    userId,
                },
                order: { wearCount: 'ASC' },
                take: 20,
                select: ['id', 'name', 'category', 'imageUrl', 'wearCount', 'dateAdded']
            });
            return rarelyUsedItems
                .filter(item => (item.wearCount || 0) < 2)
                .map(item => {
                    let monthsOld = 1;
                    if (item.dateAdded) {
                        const now = new Date();
                        const added = new Date(item.dateAdded);
                        monthsOld = Math.max(1, Math.floor((now - added) / (1000 * 60 * 60 * 24 * 30)));
                    }

                    return {
                        ...item,
                        monthsOld
                    };
                });
        } catch (error) {
            console.error('Error getting rarely used items:', error);
            return [];
        }
    }

    async getColorAnalysis(userId) {
        try {
            const items = await this.itemRepository.find({
                where: { userId },
                select: ['category', 'wearCount', 'color', 'id']
            });

            if (!items || items.length === 0) {
                return {
                    totalUniqueColors: 0,
                    mostWornColors: []
                };
            }
            const colorStats = {};
            items.forEach(item => {
                const color = item.color || 'unknown';
                if (!colorStats[color]) {
                    colorStats[color] = {
                        color,
                        itemCount: 0,
                        totalWears: 0
                    };
                }
                colorStats[color].itemCount++;
                colorStats[color].totalWears += item.wearCount || 0;
            });

            const mostWornColors = Object.values(colorStats)
                .sort((a, b) => b.totalWears - a.totalWears)
                .slice(0, 10);

            return {
                totalUniqueColors: Object.keys(colorStats).length,
                mostWornColors
            };
        } catch (error) {
            console.error('Error getting color analysis:', error);
            return {
                totalUniqueColors: 0,
                mostWornColors: []
            };
        }
    }

    async getSustainabilityStats(userId) {
        try {
            const items = await this.itemRepository.find({
                where: { userId },
                select: ['wearCount', 'category']
            });

            if (!items || items.length === 0) {
                return {
                    sustainabilityScore: 0,
                    avgWearsPerItem: 0,
                    totalCO2Footprint: 0,
                    co2PerWear: 0,
                    recommendation: 'Add items to your wardrobe to get sustainability insights'
                };
            }

            const totalWears = items.reduce((sum, item) => sum + (item.wearCount || 0), 0);
            const avgWearsPerItem = totalWears / items.length;
            // Simple sustainability scoring based on wear frequency
            let sustainabilityScore = 0;
            if (avgWearsPerItem >= 10) sustainabilityScore = 90;
            else if (avgWearsPerItem >= 7) sustainabilityScore = 80;
            else if (avgWearsPerItem >= 5) sustainabilityScore = 70;
            else if (avgWearsPerItem >= 3) sustainabilityScore = 60;
            else if (avgWearsPerItem >= 1) sustainabilityScore = 40;
            else sustainabilityScore = 20;
            const avgCO2PerItem = 15; // kg CO2 per clothing item just an estimate
            const totalCO2Footprint = items.length * avgCO2PerItem;
            const co2PerWear = totalWears > 0 ? totalCO2Footprint / totalWears : totalCO2Footprint;

            let recommendation = '';
            if (sustainabilityScore < 60) {
                recommendation = 'Try to wear your existing items more often before buying new ones to improve sustainability.';
            } else if (sustainabilityScore < 80) {
                recommendation = 'Good progress! Continue wearing items regularly to maximize their value.';
            } else {
                recommendation = 'Excellent! You\'re making great use of your wardrobe sustainably.';
            }

            return {
                sustainabilityScore: Math.round(sustainabilityScore),
                avgWearsPerItem: Math.round(avgWearsPerItem * 10) / 10,
                totalCO2Footprint: Math.round(totalCO2Footprint),
                co2PerWear: Math.round(co2PerWear * 10) / 10,
                recommendation
            };
        } catch (error) {
            console.error('Error getting sustainability stats:', error);
            return {
                sustainabilityScore: 0,
                avgWearsPerItem: 0,
                totalCO2Footprint: 0,
                co2PerWear: 0,
                recommendation: 'Unable to calculate sustainability metrics at this time'
            };
        }
    }

    async getActionableInsights(userId) {
        try {
            const [
                basicStats,
                rarelyUsedItems,
                sustainabilityStats
            ] = await Promise.all([
                this.getBasicWardrobeStats(userId),
                this.getRarelyUsedItems(userId),
                this.getSustainabilityStats(userId)
            ]);

            const insights = [];
            if (rarelyUsedItems.length > 5) {
                insights.push({
                    type: 'warning',
                    title: 'Many unused items',
                    description: `You have ${rarelyUsedItems.length} items that are rarely used. Consider donating them or creating new outfits.`,
                    action: 'review_unused_items'
                });
            }

            if (sustainabilityStats.sustainabilityScore < 60) {
                insights.push({
                    type: 'info',
                    title: 'Improve sustainability',
                    description: 'Try to wear your existing items more often before buying new ones.',
                    action: 'focus_on_existing'
                });
            }

            if (basicStats.totalOutfits < 5 && basicStats.totalItems > 10) {
                insights.push({
                    type: 'suggestion',
                    title: 'Create more outfits',
                    description: 'You have many items but few outfits. Creating outfits can help you wear items more consistently.',
                    action: 'create_outfits'
                });
            }

            return { insights };
            
        } catch (error) {
            console.error('Error generating insights:', error);
            return { insights: [] };
        }
    }
}