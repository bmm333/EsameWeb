import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import { Media } from './entities/media.entity.js';

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
    async uploadImage(userId,file,options={})
    {
        try{
            if(!file){
                throw new BadRequestException('No file provided');
            }
            if(!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/))
            {
                throw new BadRequestException('Only image files are allowed');
            }
            if(file.size>5*1024*1024)
            {
                throw new BadRequestException('File size exceeds the limit of 5MB');
            }
            let processedBuffer=file.buffer;
            if(options.removeBackground&&this.removeBgApiKey)
            {
                processedBuffer=await this.removeBackground(file.buffer);
            }
            const timestamp=Date.now();
            const ext=file.originalname.split('.').pop();
            const folder=options.folder||'general';
            const key=`${folder}/${userId}/${timestamp}.${ext}`;

            const uploadParams={
                Bucket:this.bucketName,
                Key:key,
                Body:processedBuffer,
                ContentType:file.mimetype,
                //ACL:'public-read'
            }
            const result=await this.s3.upload(uploadParams).promise();
            //saving to db only record 
            const media = this.mediaRepository.create({
            userId,
            originalName: file.originalname,
            fileName: key,
            url: result.Location,
            mimeType: file.mimetype,
            size: processedBuffer.length,
            folder,
            backgroundRemoved: options.removeBackground || false,
            metadata: options.metadata || {}
        });

        await this.mediaRepository.save(media);

        return {
            success: true,
            media: {
            id: media.id,
            url: result.Location,
            fileName: key,
            originalName: file.originalname
            }
        };
        }catch(error)
        {
            throw new BadRequestException(`Image upload failed ${error.message}`);
        }
    }
    async removeBackground(imageBuffer) {
    try {
      if (!this.removeBgApiKey) {
        console.warn('Remove.bg API key not configured, skipping background removal');
        return imageBuffer;
      }

      const formData = new FormData();
      formData.append('image_file', new Blob([imageBuffer]), 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Remove.bg API error:', error);
        return imageBuffer;
      }
      const processedImageBuffer = await response.buffer();
      console.log('Background removed successfully');
      return processedImageBuffer;
    } catch (error) {
      console.error('Background removal error:', error);
      return imageBuffer;
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
      console.error('Media deletion error:', error);
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