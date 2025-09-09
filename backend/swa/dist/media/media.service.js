"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.MediaService = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _typeorm2 = require("typeorm");
var _awsSdk = _interopRequireDefault(require("aws-sdk"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _mediaEntity = require("./entities/media.entity.js");
var _formData = _interopRequireDefault(require("form-data"));
var _dec, _dec2, _dec3, _dec4, _class;
let MediaService = exports.MediaService = (_dec = (0, _common.Injectable)(), _dec2 = function (target, key) {
  return (0, _typeorm.InjectRepository)(_mediaEntity.Media)(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class MediaService {
  constructor(mediaRepository) {
    this.mediaRepository = mediaRepository;
    this.s3 = new _awsSdk.default.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.removeBgApiKey = process.env.REMOVE_BG_API_KEY;
  }
  async uploadImage(userId, file, options = {}) {
    try {
      console.log('MediaService.uploadImage called with userId:', userId);
      if (!file) {
        throw new _common.BadRequestException('No file provided');
      }
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        throw new _common.BadRequestException('Only image files are allowed');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new _common.BadRequestException('File size exceeds the limit of 5MB');
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
        ContentType: file.mimetype
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
      throw new _common.BadRequestException(`Image upload failed: ${error.message}`);
    }
  }
  async removeBackground(file) {
    try {
      if (!this.removeBgApiKey) {
        return {
          buffer: file.buffer,
          removed: false
        };
      }
      const form = new _formData.default();
      form.append('image_file', file.buffer, {
        filename: file.originalname || 'image.png',
        contentType: file.mimetype || 'image/png'
      });
      form.append('size', 'auto');
      const response = await (0, _nodeFetch.default)('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
          ...form.getHeaders()
        },
        body: form
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
          buffer: file.buffer,
          removed: false
        };
      }
      const processed = await response.buffer();
      return {
        buffer: processed,
        removed: true
      };
    } catch (error) {
      return {
        buffer: file.buffer,
        removed: false
      };
    }
  }
  async deleteImage(mediaId, userId) {
    try {
      const media = await this.mediaRepository.findOne({
        where: {
          id: mediaId,
          userId
        }
      });
      if (!media) {
        throw new _common.BadRequestException('Media not found');
      }
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: media.fileName
      }).promise();
      await this.mediaRepository.remove(media);
      return {
        success: true,
        message: 'Media deleted successfully'
      };
    } catch (error) {
      throw new _common.BadRequestException(`Media deletion failed: ${error.message}`);
    }
  }
  async getUserMedia(userId, folder = null) {
    const query = {
      userId
    };
    if (folder) {
      query.folder = folder;
    }
    return this.mediaRepository.find({
      where: query,
      order: {
        createdAt: 'DESC'
      }
    });
  }
}) || _class) || _class) || _class) || _class);