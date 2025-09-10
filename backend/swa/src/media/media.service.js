import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import { Media } from './entities/media.entity.js';
import FormData from 'form-data';


@Injectable()
export class MediaService{
    constructor(@InjectRepository(Media)mediaRepository)
    {
        this.mediaRepository=mediaRepository;
        this.s3=new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        this.bucketName=process.env.AWS_BUCKET_NAME;
        this.removeBgApiKey=process.env.REMOVE_BG_API_KEY;
    }
  async uploadImage(userId, file, options = {}) {
  try {
    console.log('MediaService.uploadImage called with userId:', userId);
    
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      throw new BadRequestException('Only image files are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the limit of 5MB');
    }

    let processedBuffer = file.buffer;
    let backgroundRemoved = false;

    if (options.removeBackground && this.removeBgApiKey) {
      const result = await this.removeBackground(file);
      if (result?.buffer && result.buffer.length > 0) {
        processedBuffer = result.buffer;
        backgroundRemoved = result.removed === true;
      }
    }
    const timestamp = Date.now();
    const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
    const folder = options.folder || 'general';
    const key = `${folder}/${userId}/${timestamp}.${ext}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: file.mimetype,
     // ACL: 'public-read',
    }; 
    const result = await this.s3.upload(uploadParams).promise();
    const media = this.mediaRepository.create({
      userId,
      originalName: file.originalname,
      fileName: key,
      url: result.Location,
      mimeType: file.mimetype,
      size: processedBuffer.length,
      folder,
      backgroundRemoved,
      metadata: options.metadata || {}
    });

    await this.mediaRepository.save(media);
    const response = {
      success: true,
      url: result.Location,
      media: {
        id: media.id,
        url: result.Location,
        fileName: key,
        originalName: file.originalname,
        backgroundRemoved
      }
    };
    return response;
    
  } catch (error) {
    throw new BadRequestException(`Image upload failed: ${error.message}`);
  }
}

  async removeBackground(file) {
    try {
      if (!this.removeBgApiKey) {
        return { buffer: file.buffer, removed: false };
      }

      const form = new FormData();
      form.append('image_file', file.buffer, {
        filename: file.originalname || 'image.png',
        contentType: file.mimetype || 'image/png'
      });
      form.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
          ...form.getHeaders()
        },
        body: form
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return { buffer: file.buffer, removed: false };
      }

      const processed = await response.buffer();
      return { buffer: processed, removed: true };
    } catch (error) {
      return { buffer: file.buffer, removed: false };
    }
  }
  async deleteImage(mediaId, userId) {
    try {
      const media = await this.mediaRepository.findOne({
        where: { id: mediaId, userId }
      });
      if (!media) {
        throw new BadRequestException('Media not found');
      }
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: media.fileName
      }).promise();
      await this.mediaRepository.remove(media);
      return { success: true, message: 'Media deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Media deletion failed: ${error.message}`);
    }
  }
  async getUserMedia(userId, folder = null) {
    const query = { userId };
    if (folder) {
      query.folder = folder;
    }
    return this.mediaRepository.find({
      where: query,
      order: { createdAt: 'DESC' }
    });
  }
}