import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Request, Bind, Dependencies, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemService } from './item.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('item')
@Dependencies(ItemService)
export class ItemController {
    constructor(itemService) {
        this.itemService = itemService;
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload-image')
    @UseInterceptors(FileInterceptor('image', {
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    }))
    @Bind(Request(), UploadedFile())
    async uploadImage(req, file) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.uploadImageToS3(userId, file);
    }

    @UseGuards(JwtAuthGuard)
    @Post('associate')
    @Bind(Request(), Body())
    async associateItem(req, body) {
        const userId = req.user.id || req.user.userId;
        const { tagId, itemData, override } = body;
        return await this.itemService.addOrUpdateItem(userId, tagId, itemData, override);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @Bind(Request(), Query())
    async getAllItems(req, query) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.getAllItems(userId, query);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':tagId')
    @Bind(Request(), Param('tagId'))
    async getItemByTag(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.getItemByTagId(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':tagId')
    @Bind(Request(), Param('tagId'), Body())
    async updateItem(req, tagId, itemData) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.updateItem(userId, tagId, itemData);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':tagId/wear')
    @Bind(Request(), Param('tagId'))
    async logWear(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.logWear(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':tagId/location')
    @Bind(Request(), Param('tagId'), Body())
    async updateLocation(req, tagId, body) {
        const userId = req.user.id || req.user.userId;
        const { location } = body;
        return await this.itemService.updateLocation(userId, tagId, location);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':tagId/favorite')
    @Bind(Request(), Param('tagId'))
    async toggleFavorite(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.toggleFavorite(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':tagId/wear-history')
    @Bind(Request(), Param('tagId'))
    async getWearHistory(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.getWearHistory(userId, tagId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':tagId')
    @Bind(Request(), Param('tagId'))
    async deleteItem(req, tagId) {
        const userId = req.user.id || req.user.userId;
        return await this.itemService.deleteItem(userId, tagId);
    }
}