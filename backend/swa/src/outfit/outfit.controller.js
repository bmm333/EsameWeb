import { Controller, Post, Get, Req, Put, Delete, Body, Param, Query, UseGuards, Request, Bind, ForbiddenException,Dependencies, UseInterceptors, UploadedFile, UsePipes, ValidationPipe, BadRequestException, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OutfitService } from './outfit.service';
import { UserService } from '../user/user.service';
import { TrialGuard } from '../common/guard/trial.guard';


@Controller('outfit')
@UseGuards(JwtAuthGuard,TrialGuard)
@Dependencies(OutfitService, UserService)
export class OutfitController {
    constructor(outfitService, userService) {
        this.outfitService = outfitService;
        this.userService = userService;
    }

    @Post()
    async create(@Body() createOutfitDto, @Req() req) {
        console.log('Creating outfit with data:', createOutfitDto);
        
        if (!createOutfitDto.name || !createOutfitDto.name.trim()) {
            throw new BadRequestException('Outfit name is required');
        }
        
        if (!createOutfitDto.itemIds || !Array.isArray(createOutfitDto.itemIds) || createOutfitDto.itemIds.length === 0) {
            throw new BadRequestException('At least one item is required');
        }
        
        const userId = req.user.id;

        if (req.trialUser && req.trialLimits && req.trialLimits.outfitsUsed >= req.trialLimits.maxOutfits) {
            throw new ForbiddenException({
                message: 'Outfit limit reached for trial users. Upgrade to create more outfits.',
                code: 'TRIAL_LIMIT_EXCEEDED',
            });
        }

        const result = await this.outfitService.createOutfit(userId, createOutfitDto);
        if (req.trialUser) {
            await this.userService.updateUserRecord(userId,{trialOutfitsUsed: (req.trialLimits.outfitsUsed || 0) + 1});
        }

        return result;
    }

    @Get()
    async getAllOutfits(@Req() req, @Query() query) {
        const userId = req.user.id;
        const filters = {
            occasion: query.occasion,
            season: query.season,
            isFavorite: query.favorite === 'true' ? true : query.favorite === 'false' ? false : undefined,
            search: query.search
        };
        return await this.outfitService.getAllOutfits(userId, filters);
    }
    @Get(':id')
    async getOutfitById(@Req() req, @Param('id') outfitId) {
        const userId = req.user.id;
        return await this.outfitService.getOutfitById(userId, outfitId);
    }
    @Put(':id')
    async updateOutfit(@Req() req, @Param('id') outfitId, @Body() updateOutfitDto) {
        const userId = req.user.id;
        return await this.outfitService.updateOutfit(userId, outfitId, updateOutfitDto);
    }
    @Delete(':id')
    async deleteOutfit(@Req() req, @Param('id') outfitId) {
        const userId = req.user.id;
        return await this.outfitService.deleteOutfit(userId, outfitId);
    }
    @Patch(':id/worn')
    async logWear(@Req() req, @Param('id') outfitId, @Body() body) {
        const userId = req.user.id;
        console.log('Marking outfit as worn:', outfitId, 'by user:', userId);
        return await this.outfitService.logWear(userId, outfitId);
    }
    @Patch(':id/favorite')
    async toggleFavorite(@Req() req, @Param('id') outfitId, @Body() body) {
        const userId = req.user.id;
        console.log('Toggling favorite for outfit:', outfitId, 'by user:', userId);
        return await this.outfitService.toggleFavorite(userId, outfitId);
    }
    
    @Get(':id/availability')
    async checkAvailability(@Req() req, @Param('id') outfitId) {
        const userId = req.user.id;
        const outfit = await this.outfitService.getOutfitById(userId, outfitId);
        return {
            outfitId,
            isAvailable: outfit.isAvailable,
            availableItems: outfit.availableItems,
            unavailableItems: outfit.unavailableItems
        };
    }
}