import { Controller, Dependencies,Post, Get, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ItemService } from './item.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TrialGuard } from '../common/guard/trial.guard.js';
import { ItemLimitGuard } from '../common/guard/item-limit.guard.js';

@Controller('item')
@Dependencies(ItemService)
@UseGuards(JwtAuthGuard,TrialGuard)
export class ItemController {
    constructor(itemService) {
        this.itemService = itemService;
    }
    @Post()
    @UseGuards(ItemLimitGuard)
    async create(@Request() req, @Body() body) {
        return this.itemService.create(req.user.id, body);
    }
    @Get()
    async findAll(@Request() req, @Query() query) {
        return this.itemService.findAll(req.user.id, query);
    }
    @Get(':id')
    async findOne(@Request() req, @Param('id') id) {
        return this.itemService.findOne(req.user.id, +id);
    }
    @Put(':id')
    async update(@Request() req, @Param('id') id, @Body() body) {
        return this.itemService.update(+id, req.user.id, body);
    }
    @Delete(':id')
    async remove(@Request() req, @Param('id') id) {
        return this.itemService.remove(req.user.id, +id);
    }
    @Get(':id/availability')
    async getAvailability(@Request() req, @Param('id') id) {
        return this.itemService.getItemAvailability(req.user.id, +id);
    }
    @Put(':id/favorite')
    async toggleFavorite(@Request() req, @Param('id') id, @Body() body) {
        return this.itemService.toggleFavorite(req.user.id, +id, body.favorite);
    }
}