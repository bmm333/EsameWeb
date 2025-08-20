import { Injectable } from '@nestjs/common';
import { RfidTag } from '../rfid/entities/rfid-tag.entity';

@Injectable()
export class ItemService {
    constructor(@InjectRepository(RfidTag)rfidTagRepository){
        this.rfidTagRepository = rfidTagRepository;
        this.s3=new AWS.S3({
            accessKeyId:process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
            region:process.env.AWS_REGION
        })
        this.bucketName=process.env.AWS_S3_BUCKET_NAME;
    }

    async uploadImageToS3(userId,file)
    {
        try{
            if(!file)
            {
                throw new Error('No file provided');
            }
            const timestamp=Date.now();
            const ext=file.originalname.split('.').pop();
            const key=`items/${userId}/${timestamp}.${ext}`;
            const uploadParams={
                Bucket:this.bucketName,
                Key:key,
                Body:file.buffer,
                ContentType:file.mimetype,
                ACL:'public-read'
            };
            const result=await this.s3.upload(uploadParams).promise();
            return{
                success:true,
                imageUrl:result.Location,
                key:result.key
            };
        }catch(error)
        {
            throw new Error(`Image upload failed:${error.message}`);
        }
    }
    async deleteImageFromS3(imageUrl)
    {
        try{
            if(!imageUrl)return;
            const key=imageUrl.split('.amazonaws.com/')[1];
            await this.s3.deleteObject({
                Bucket:this.bucketName,
                Key:key
            }).promise();
        }catch(error)
        {
            console.error('S3 delete error: ',error);
        }
    }
    async addOrUpdateItem(userId, tagId, itemData, override = false) {
        const tag = await this.findTagByIdAndUser(userId, tagId);
        
        if (tag.itemName && !override) {
            return this.createConflictResponse(tag);
        }
        
        const enhancedMetadata = this.buildItemMetadata(itemData, tag.itemMetadata);
        
        tag.itemName = itemData.name;
        tag.itemCategory = itemData.category;
        tag.itemMetadata = enhancedMetadata;
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, tag: this.formatItemResponse(tag) };
    }
    async getAllItems(userId, filters = {}) {
        const whereCondition = { userId, itemName: Not(IsNull()) };
        
        if (filters.category) {
            whereCondition.itemCategory = filters.category;
        }
        
        const tags = await this.rfidTagRepository.find({ where: whereCondition });
        let items = tags.map(tag => this.formatItemResponse(tag));
        
        return this.applyFilters(items, filters);
    }
    async getItemByTagId(userId, tagId) {
        const tag = await this.findItemByTagId(userId, tagId);
        return this.formatItemResponse(tag);
    }
    async updateItem(userId, tagId, itemData) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        const currentMetadata = tag.itemMetadata || {};
        
        tag.itemName = itemData.name || tag.itemName;
        tag.itemCategory = itemData.category || tag.itemCategory;
        tag.itemMetadata = this.mergeItemMetadata(currentMetadata, itemData);
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, tag: this.formatItemResponse(tag) };
    }
    async logWear(userId, tagId) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        const metadata = tag.itemMetadata || {};
        const wearHistory = metadata.wearHistory || [];
        
        wearHistory.push({
            date: new Date(),
            duration: null,
            occasion: null
        });
        
        tag.itemMetadata = {
            ...metadata,
            wearCount: (metadata.wearCount || 0) + 1,
            lastWorn: new Date(),
            wearHistory,
            location: 'worn'
        };
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, tag: this.formatItemResponse(tag) };
    }
    async updateLocation(userId, tagId, location) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        const metadata = tag.itemMetadata || {};
        tag.itemMetadata = {
            ...metadata,
            location,
            lastLocationUpdate: new Date()
        };
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, tag: this.formatItemResponse(tag) };
    }
    async toggleFavorite(userId, tagId) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        const metadata = tag.itemMetadata || {};
        tag.itemMetadata = {
            ...metadata,
            isFavorite: !metadata.isFavorite
        };
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, isFavorite: tag.itemMetadata.isFavorite };
    }
    async getWearHistory(userId, tagId) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        const metadata = tag.itemMetadata || {};
        return {
            itemName: tag.itemName,
            wearCount: metadata.wearCount || 0,
            lastWorn: metadata.lastWorn,
            wearHistory: metadata.wearHistory || []
        };
    }
    async deleteItem(userId, tagId) {
        const tag = await this.findItemByTagId(userId, tagId);
        
        // Delete associated image
        const metadata = tag.itemMetadata || {};
        if (metadata.imageUrl) {
            await this.deleteImageFromS3(metadata.imageUrl);
        }
        
        // Clear item data but keep the tag
        tag.itemName = null;
        tag.itemCategory = null;
        tag.itemMetadata = null;
        tag.lastUpdated = new Date();
        
        await this.rfidTagRepository.save(tag);
        return { success: true, message: 'Item deleted successfully' };
    }
   async findTagByIdAndUser(userId, tagId) {
        const tag = await this.rfidTagRepository.findOne({ where: { tagId, userId } });
        if (!tag) throw new NotFoundException('RFID Tag not found');
        return tag;
    }

    async findItemByTagId(userId, tagId) {
        const tag = await this.rfidTagRepository.findOne({
            where: { tagId, userId, itemName: Not(IsNull()) }
        });
        if (!tag) throw new NotFoundException('Item not found');
        return tag;
    }

    createConflictResponse(tag) {
        return {
            conflict: true,
            existingItem: {
                name: tag.itemName,
                category: tag.itemCategory,
                metadata: tag.itemMetadata
            }
        };
    }

    buildItemMetadata(itemData, existingMetadata = {}) {
        return {
            imageUrl: itemData.imageUrl || null,
            wearCount: existingMetadata.wearCount || 0,
            lastWorn: existingMetadata.lastWorn || null,
            wearHistory: existingMetadata.wearHistory || [],
            location: itemData.location || 'wardrobe',
            lastLocationUpdate: new Date(),
            tags: itemData.tags || [],
            isFavorite: itemData.isFavorite || false,
            color: itemData.color || null,
            brand: itemData.brand || null,
            size: itemData.size || null,
            season: itemData.season || [],
            notes: itemData.notes || null,
            dateAdded: new Date(),
            purchaseDate: itemData.purchaseDate || null,
            price: itemData.price || null
        };
    }

   mergeItemMetadata(currentMetadata, itemData) {
        return {
            ...currentMetadata,
            imageUrl: itemData.imageUrl !== undefined ? itemData.imageUrl : currentMetadata.imageUrl,
            location: itemData.location !== undefined ? itemData.location : currentMetadata.location,
            tags: itemData.tags !== undefined ? itemData.tags : currentMetadata.tags,
            isFavorite: itemData.isFavorite !== undefined ? itemData.isFavorite : currentMetadata.isFavorite,
            color: itemData.color !== undefined ? itemData.color : currentMetadata.color,
            brand: itemData.brand !== undefined ? itemData.brand : currentMetadata.brand,
            size: itemData.size !== undefined ? itemData.size : currentMetadata.size,
            season: itemData.season !== undefined ? itemData.season : currentMetadata.season,
            notes: itemData.notes !== undefined ? itemData.notes : currentMetadata.notes,
            lastLocationUpdate: itemData.location !== currentMetadata.location ? new Date() : currentMetadata.lastLocationUpdate
        };
    }

    applyFilters(items, filters) {
        if (filters.location) {
            items = items.filter(item => item.location === filters.location);
        }
        if (filters.isFavorite === 'true') {
            items = items.filter(item => item.isFavorite === true);
        }
        if (filters.tag) {
            items = items.filter(item => item.tags.includes(filters.tag));
        }
        if (filters.season) {
            items = items.filter(item => 
                item.season.includes(filters.season) || item.season.includes('all')
            );
        }
        return items;
    }

    formatItemResponse(tag) {
        const metadata = tag.itemMetadata || {};
        return {
            id: tag.id,
            tagId: tag.tagId,
            name: tag.itemName,
            category: tag.itemCategory,
            imageUrl: metadata.imageUrl,
            location: metadata.location || 'wardrobe',
            wearCount: metadata.wearCount || 0,
            lastWorn: metadata.lastWorn,
            isFavorite: metadata.isFavorite || false,
            tags: metadata.tags || [],
            color: metadata.color,
            brand: metadata.brand,
            size: metadata.size,
            season: metadata.season || [],
            notes: metadata.notes,
            dateAdded: metadata.dateAdded,
            lastUpdated: tag.lastUpdated,
            lastScanned: tag.lastScanned,
            lastLocationUpdate: metadata.lastLocationUpdate
        };
    }
}
