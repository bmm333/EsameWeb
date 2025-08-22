import { Controller } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OutfitService } from './outfit.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { Get } from '../../../../../../home/codespace/.cache/typescript/5.9/node_modules/@sinclair/typebox/build/cjs/type/registry/format';
import { UpdateOutfitDto } from './dto/update-outfit.dto';

@Controller('outfit')
@UseGuards(JwtAuthGuard)
@Dependencies(OutfitService)
export class OutfitController {
    constructor(outfitService)
    {this.outfitService = outfitService;}

    @Post()
    async createOutfit(@Req()req,@Body()createOutfitDto)
    {
        const userId=req.user.id;
        return await this.outfitService.createOutfit(userId,createOutfitDto);
    }
    //get all outfits with fuiltering
    @Get()
    async getAllOutfits(@Req()req,@Query()query)
    {
        const userId=req.user.id;
        const filters={
            occasion:query.occasion,
            season:query.season,
            isFavourite:query.favorite==='true'?true:query.favorite==='false'?false:undefined,
            search:query.search
        };
        return await this.outfitService.getAllOutfits(userId,filters);
    }
    @Get(':id')
    async getOutfitById(@Req()req,@Param('id')outfitId)
    {
        const userId=req.user.id;
        return await this.outfitService.getOutfitById(userId,outfitId);
    }
    @Put(':id')
    async updateOutfit(@Req()req,@Param('id')outfitId,@Body()updateOutfitDto){
        const userId=req.user.id;
        return await this.outfitService.updateOutfit(userId,outfitId,updateOutfitDto);
    }

    @Delete(':id')
    async deleteOutfit(@Req() req, @Param('id', ParseIntPipe) outfitId) {
        const userId = req.user.id;
        return await this.outfitService.deleteOutfit(userId, outfitId);
    }

    @Post(':id/wear')
    async logWear(@Req() req, @Param('id', ParseIntPipe) outfitId) {
        const userId = req.user.id;
        return await this.outfitService.logWear(userId, outfitId);
    }
    
    @Get(':id/availability')
    async checkAvailability(@Req() req, @Param('id', ParseIntPipe) outfitId) {
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
