import { Injectable, Dependencies } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity.js';
import { Outfit } from '../outfit/entities/outfit.entity.js';
import { User } from '../user/entities/user.entity.js';

@Injectable()
@Dependencies('ItemRepository','OutfitRepository','UserRepository')
export class AnalyticsService {
    constructor(
        @InjectRepository(Item) itemRepository,
        @InjectRepository(Outfit) outfitRepository,
        @InjectRepository(User) userRepository
    ) {
        this.itemRepository = itemRepository;
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
    }


    async getBasicWardrobeStats(userId) {
        const totalItems = await this.itemRepository.count({ where: { userId } });
        const totalOutfits = await this.outfitRepository.count({ where: { userId } });
        const favoriteItems = await this.itemRepository.count({ 
            where: { userId, isFavorite: true } 
        });

        const mostWornItem = await this.itemRepository.findOne({
            where: { userId },
            order: { wearCount: 'DESC' },
            select: ['id', 'name', 'wearCount', 'imageUrl', 'category']
        });

        return {
            totalItems,
            totalOutfits,
            favoriteItems,
            mostWornItem: mostWornItem ? {
                id: mostWornItem.id,
                name: mostWornItem.name,
                wearCount: mostWornItem.wearCount || 0,
                imageUrl: mostWornItem.imageUrl,
                category: mostWornItem.category
            } : null
        };
    }


    async getWardrobeAnalytics(userId) {
        const [
            basicStats,
            mostWornItems,
            rarelyUsedItems,
            colorAnalysis,
            categoryStats,
            sustainabilityStats
        ] = await Promise.all([
            this.getBasicWardrobeStats(userId),
            this.getMostWornItems(userId),
            this.getRarelyUsedItems(userId),
            this.getColorAnalysis(userId),
            this.getCategoryStats(userId),
            this.getSustainabilityStats(userId)
        ]);

        return {
            basicStats,
            mostWornItems,
            rarelyUsedItems,
            colorAnalysis,
            categoryStats,
            sustainabilityStats
        };
    }

    async getMostWornItems(userId) {
        const items = await this.itemRepository.find({
            where: { userId },
            order: { wearCount: 'DESC' },
            take: 10,
            select: ['id', 'name', 'wearCount', 'category', 'color', 'imageUrl']
        });

        return items.map(item => ({
            id: item.id,
            name: item.name,
            wearCount: item.wearCount || 0,
            category: item.category,
            color: item.color,
            imageUrl: item.imageUrl
        }));
    }


    async getRarelyUsedItems(userId) {
        const items = await this.itemRepository.find({
            where: { userId },
            select: ['id', 'name', 'wearCount', 'category', 'createdAt', 'imageUrl']
        });

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const rarelyUsed = items.filter(item => {
            const wearCount = item.wearCount || 0;
            const isOld = new Date(item.createdAt) < threeMonthsAgo;
            return wearCount <= 2 && isOld;
        });

        return rarelyUsed
            .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
            .slice(0, 15)
            .map(item => ({
                id: item.id,
                name: item.name,
                wearCount: item.wearCount || 0,
                category: item.category,
                monthsOld: Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24 * 30)),
                imageUrl: item.imageUrl,
                suggestion: item.wearCount === 0 ? 'Consider donating' : 'Create new outfits with this item'
            }));
    }

    async getColorAnalysis(userId) {
        const items = await this.itemRepository.find({
            where: { userId },
            select: ['color', 'wearCount', 'category']
        });

        const colorStats = {};
        
        items.forEach(item => {
            if (item.color) {
                if (!colorStats[item.color]) {
                    colorStats[item.color] = {
                        totalWears: 0,
                        itemCount: 0,
                        categories: {}
                    };
                }
                colorStats[item.color].totalWears += item.wearCount || 0;
                colorStats[item.color].itemCount++;
                
                if (!colorStats[item.color].categories[item.category]) {
                    colorStats[item.color].categories[item.category] = 0;
                }
                colorStats[item.color].categories[item.category]++;
            }
        });

        const sortedColors = Object.entries(colorStats)
            .map(([color, stats]) => ({
                color,
                totalWears: stats.totalWears,
                itemCount: stats.itemCount,
                avgWearsPerItem: stats.itemCount > 0 ? (stats.totalWears / stats.itemCount).toFixed(1) : 0,
                categories: Object.keys(stats.categories)
            }))
            .sort((a, b) => b.totalWears - a.totalWears)
            .slice(0, 8);

        return {
            mostWornColors: sortedColors,
            totalUniqueColors: Object.keys(colorStats).length
        };
    }

    async getCategoryStats(userId) {
        const categoryStats = await this.itemRepository
            .createQueryBuilder('item')
            .select('item.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(item.wearCount)', 'totalWears')
            .addSelect('AVG(item.wearCount)', 'avgWears')
            .where('item.userId = :userId', { userId })
            .groupBy('item.category')
            .getRawMany();

        return categoryStats.map(stat => ({
            category: stat.category,
            count: parseInt(stat.count),
            totalWears: parseInt(stat.totalwears || 0),
            avgWears: parseFloat(stat.avgwears || 0).toFixed(1)
        })).sort((a, b) => b.totalWears - a.totalWears);
    }

    async getSustainabilityStats(userId) {
        const items = await this.itemRepository.find({
            where: { userId },
            select: ['category', 'wearCount', 'createdAt', 'purchasePrice']
        });

        const co2PerCategory = {
            'tops': 5.5,        // Average t-shirt/shirt production
            'bottoms': 7.0,     // Average jeans/pants production
            'outerwear': 15.0,  // Average jacket/coat production
            'shoes': 12.0,      // Average shoes production
            'accessories': 2.0  // Average accessory production
        };

        let totalCO2Footprint = 0;
        let totalWears = 0;
        let itemsOver6Months = 0;
        let totalSpent = 0;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        items.forEach(item => {
            const wears = item.wearCount || 0;
            const co2ForItem = co2PerCategory[item.category] || 5.0;
            totalCO2Footprint += co2ForItem;
            totalWears += wears;
            totalSpent += item.purchasePrice || 0;
            
            if (new Date(item.createdAt) < sixMonthsAgo) {
                itemsOver6Months++;
            }
        });

        return {
            totalCO2Footprint: totalCO2Footprint.toFixed(1),
            totalWears,
            totalItems: items.length,
            avgWearsPerItem: items.length > 0 ? (totalWears / items.length).toFixed(1) : 0,
            itemsOver6Months,
            totalSpent: totalSpent.toFixed(2),
            co2PerWear: totalWears > 0 ? (totalCO2Footprint / totalWears).toFixed(2) : totalCO2Footprint.toFixed(2),
            sustainabilityScore: this.calculateSustainabilityScore(totalWears, items.length),
            recommendation: this.getSustainabilityRecommendation(totalWears, items.length, itemsOver6Months)
        };
    }


    calculateSustainabilityScore(totalWears, totalItems) {
        if (totalItems === 0) return 0;
        
        const avgWears = totalWears / totalItems;
        // Score based on how well items are utilized
        // 30+ wears per item = excellent (100 points)
        // 20-29 wears = good (80 points) 
        // 10-19 wears = fair (60 points)
        // 5-9 wears = poor (40 points)
        // <5 wears = very poor (20 points)
        if (avgWears >= 30) return 100;
        if (avgWears >= 20) return 80;
        if (avgWears >= 10) return 60;
        if (avgWears >= 5) return 40;
        return 20;
    }

    //add notifications
}