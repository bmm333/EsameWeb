import { Controller, Post, Get, Delete, UseGuards, UseInterceptors,Dependencies, UploadedFile, Request, Param, Query, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MediaService } from './media.service.js';

@Controller('media')
@UseGuards(JwtAuthGuard)
@Dependencies(MediaService)
export class MediaController {
  constructor(mediaService) {
    this.mediaService = mediaService;
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
  }))
  async uploadMedia(req, file, body) {
    const userId = req.user.id || req.user.userId;
    const options = {
      folder: body.folder || 'general',
      removeBackground: body.removeBackground === 'true',
      metadata: body.metadata ? JSON.parse(body.metadata) : {}
    };

    return this.mediaService.uploadImage(userId, file, options);
  }

  @Post('upload/profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(req, file) {
    const userId = req.user.id || req.user.userId;
    return this.mediaService.uploadImage(userId, file, {
      folder: 'profiles',
      removeBackground: false
    });
  }

  @Post('upload/item')
  @UseInterceptors(FileInterceptor('file'))
  async uploadItemPhoto(req, file, body) {
    const userId = req.user.id || req.user.userId;
    return this.mediaService.uploadImage(userId, file, {
      folder: 'items',
      removeBackground: body.removeBackground !== 'false', // Default to true only for items, profile photos dont need background removal
      metadata: { itemId: body.itemId }
    });
  }

  @Get()
  async getUserMedia(req, query) {
    const userId = req.user.id || req.user.userId;
    return this.mediaService.getUserMedia(userId, query.folder);
  }

  @Delete(':id')
  async deleteMedia(req, param) {
    const userId = req.user.id || req.user.userId;
    return this.mediaService.deleteImage(param.id, userId);
  }

}