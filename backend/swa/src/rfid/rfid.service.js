import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RfidDevice } from './entities/rfid-device.entity.js';
import { RfidTag } from './entities/rfid-tag.entity.js';
import { Item } from '../item/entities/item.entity.js';

@Injectable()
export class RfidService {
    constructor(
        @InjectRepository(RfidDevice) deviceRepo,
        @InjectRepository(RfidTag) tagRepo,
        @InjectRepository(Item) itemRepo,
        @InjectDataSource() dataSource 
    ) {
        this.deviceRepo = deviceRepo;
        this.tagRepo = tagRepo;
        this.itemRepo = itemRepo;
        this.dataSource = dataSource;
        this.latestScans = new Map();
        this.associationMode = new Map();
    }


    async setAssociationMode(userId, isActive) {
        if (isActive) {
            this.associationMode.set(userId, true);
            console.log('[RFID] User %s entered association mode', userId);
        } else {
            this.associationMode.delete(userId);
            console.log('[RFID] User %s exited association mode', userId);
        }
    }

    async generateApiKey(userId, deviceName) {
        const apiKey = require('crypto').randomBytes(32).toString('hex');
        
        let device = await this.deviceRepo.findOne({ where: { userId } });
        if (device) {
            device.apiKey = apiKey;
            device.deviceName = deviceName;
        } else {
            device = this.deviceRepo.create({
                apiKey, deviceName, userId,
                status: 'active', isOnline: false
            });
        }
        
        await this.deviceRepo.save(device);
        return { apiKey, deviceName };
    }

    async validateApiKey(apiKey) {
        const device = await this.deviceRepo.findOne({ where: { apiKey } });
        if (!device) throw new UnauthorizedException('Invalid API key');
        return device;
    }

    async heartbeat(apiKey) {
        const device = await this.validateApiKey(apiKey);
        device.lastHeartbeat = new Date();
        device.isOnline = true;
        await this.deviceRepo.save(device);
        return { status: 'ok', nextScanInterval: 5000 };
    }

    async processScan(apiKey, scanData) {
        console.log('[RFID] processScan called with apiKey:', apiKey, 'scanData:', scanData);
        
        try {
            const device = await this.validateApiKey(apiKey);
            console.log('[RFID] Device validated:', device.id, 'userId:', device.userId);
            const isInAssociationMode = this.associationMode.has(device.userId);
            console.log('[RFID] Association mode check:', isInAssociationMode);
            if (!scanData || !scanData.detectedTags || !Array.isArray(scanData.detectedTags)) {
                console.log('[RFID] Invalid scan data structure:', scanData);
                return { message: 'Invalid scan data' };
            }
            
            console.log('[RFID] Starting tag processing loop for', scanData.detectedTags.length, 'tags');
            
            for (const tagData of scanData.detectedTags) {
                console.log('[RFID] Processing scan for tag:', tagData.tagId, 'user:', device.userId, 'associationMode:', isInAssociationMode);
                
                try {
                    let tag = await this.tagRepo.findOne({ 
                        where: { tagId: tagData.tagId, userId: device.userId }
                    });
                    console.log('[RFID] Tag lookup result:', tag ? 'FOUND' : 'NOT FOUND');
                    if (tag) {
                        console.log('[RFID] Found existing tag, current location:', tag.location, 'itemId:', tag.itemId);
                        tag.lastDetected = new Date();
                        tag.deviceId = device.id;
                        if (isInAssociationMode) {
                            tag.location = 'wardrobe';
                            console.log('[RFID] Tag %s set to wardrobe (association mode)', tagData.tagId);
                        } else if (tag.itemId) {
                            const oldLocation = tag.location;
                            const newLocation = oldLocation === 'wardrobe' ? 'being_worn' : 'wardrobe';
                            tag.location = newLocation;
                            console.log('[RFID] Tag %s location changed from %s to %s', tagData.tagId, oldLocation, newLocation);
                            try {
                                const associatedItem = await this.itemRepo.findOne({ 
                                    where: { id: tag.itemId, userId: device.userId } 
                                });
                                
                                if (associatedItem) {
                                    associatedItem.location = newLocation;
                                    associatedItem.lastLocationUpdate = new Date();
                                    if (newLocation === 'being_worn') {
                                        associatedItem.wearCount = (associatedItem.wearCount || 0) + 1;
                                        associatedItem.lastWorn = new Date();
                                        const wearHistory = associatedItem.wearHistory || [];
                                        wearHistory.push({
                                            date: new Date(),
                                            location: 'being_worn'
                                        });
                                        associatedItem.wearHistory = wearHistory;
                                    }
                                    
                                    await this.itemRepo.save(associatedItem);
                                    console.log('[RFID] Updated item %s location to %s', associatedItem.name, newLocation);
                                }
                            } catch (itemError) {
                                console.error('[RFID] Error updating associated item:', itemError);
                            }
                        } else {
                            console.log('[RFID] Tag %s scanned but not associated with any item', tagData.tagId);
                        }
                        
                        console.log('[RFID] About to save existing tag...');
                        await this.tagRepo.save(tag);
                        console.log('[RFID] Successfully saved existing tag');
                        
                    } else {
                        console.log('[RFID] Tag not found for this user, checking global...');
                        const existingTag = await this.tagRepo.findOne({ 
                            where: { tagId: tagData.tagId } 
                        });
                        if (existingTag) {
                            console.log('[RFID] Tag belongs to different user %s, transferring to %s', existingTag.userId, device.userId);
                            existingTag.userId = device.userId;
                            existingTag.deviceId = device.id;
                            existingTag.lastDetected = new Date();
                            existingTag.itemId = null; 
                            existingTag.location = 'wardrobe';
                            console.log('[RFID] About to save transferred tag...');
                            await this.tagRepo.save(existingTag);
                            console.log('[RFID] Successfully saved transferred tag');
                            tag = existingTag;
                        } else {
                            console.log('[RFID] Creating new tag for user %s', device.userId);
                            tag = this.tagRepo.create({
                                tagId: tagData.tagId,
                                userId: device.userId,
                                deviceId: device.id,
                                status: 'detected',
                                location: 'wardrobe', 
                                lastDetected: new Date()
                            });
                            
                            console.log('[RFID] About to save new tag...');
                            await this.tagRepo.save(tag);
                            console.log('[RFID] Created new tag with ID:', tag.id);
                        }
                    }
                    console.log('[RFID] CACHING SCAN FOR USER:', device.userId);
                    const scanToCache = { 
                        tagId: tag.tagId,
                        timestamp: new Date(),
                        consumed: false
                    };
                    this.latestScans.set(device.userId, scanToCache);
                    console.log('[RFID] *** CACHED SCAN FOR USER %s: %s ***', device.userId, tag.tagId);
                    console.log('[RFID] Cache contents:', this.latestScans.get(device.userId));
                    
                } catch (tagError) {
                    console.error('[RFID] Error processing tag %s:', tagData.tagId, tagError);
                }
            }
            
            console.log('[RFID] processScan completed successfully');
            return { message: 'Scan processed' };
            
        } catch (error) {
            console.error('[RFID] processScan failed with error:', error);
            return { message: 'Scan processing failed', error: error.message };
        }
    }

    async getLatestScan(userId) {
        const scan = this.latestScans.get(userId);
        
        if (scan && !scan.consumed) {
            scan.consumed = true;
            this.latestScans.set(userId, scan);
            
            console.log('[RFID] Returning fresh scan for user %s: %s', userId, scan.tagId);
            return { 
                tagId: scan.tagId, 
                timestamp: scan.timestamp 
            };
        }
        
        console.log('[RFID] No fresh scans for user %s', userId);
        return {};
    }

    async clearScanCache(userId) {
        this.latestScans.delete(userId);
        console.log('[RFID] Cleared scan cache for user %s', userId);
    }

    async associateTag(userId, tagId, itemId, forceOverride = false) {
        console.log('[RFID] Associating tag %s with item %s for user %s (force: %s)', tagId, itemId, userId, forceOverride);
        return await this.dataSource.transaction(async manager => {
            const item = await manager.findOne(Item, { 
                where: { id: itemId, userId },
                lock: { mode: 'pessimistic_write' }
            });
            
            if (!item) {
                console.log('[RFID] Item %s not found for user %s', itemId, userId);
                throw new NotFoundException(`Item with ID ${itemId} not found or doesn't belong to user`);
            }

            let tag = await manager.findOne(RfidTag, { 
                where: { tagId, userId },
                lock: { mode: 'pessimistic_write' }
            });
            
            if (!tag) {
                const device = await this.deviceRepo.findOne({ where: { userId } });
                if (!device) throw new NotFoundException('No RFID device found for user');
                tag = manager.create(RfidTag, {
                    tagId, userId,
                    deviceId: device.id,
                    status: 'detected',
                    location: 'wardrobe',
                    lastDetected: new Date()
                });
                await manager.save(tag);
                console.log('[RFID] Created new tag in transaction');
            }
            
            let existingItem = null;
            if (tag.itemId && tag.itemId !== itemId) {
                existingItem = await manager.findOne(Item, { 
                    where: { id: tag.itemId, userId },
                    lock: { mode: 'pessimistic_write' }
                });
            }
            
            if (tag.itemId && tag.itemId !== itemId) {
                if (!forceOverride) {
                    return {
                        success: false,
                        conflict: true,
                        message: `Tag is already associated with "${existingItem?.name || 'Unknown Item'}"`,
                        existingItem: existingItem ? {
                            id: existingItem.id,
                            name: existingItem.name,
                            category: existingItem.category
                        } : null
                    };
                } else {
                    if (existingItem) {
                        console.log('[RFID] Removing old item %s during override', existingItem.name);
                        tag.itemId = null;
                        await manager.save(tag);
                        
                        existingItem.rfidTagId = null;
                        await manager.save(existingItem);
                        
                        await manager.remove(existingItem);
                        console.log('[RFID] Removed old item during override');
                    }
                }
            }
            
            const finalItem = await manager.findOne(Item, { 
                where: { id: itemId, userId },
                lock: { mode: 'pessimistic_write' }
            });
            
            if (!finalItem) {
                throw new NotFoundException('Target item was deleted during operation');
            }
            
            tag.itemId = itemId;
            tag.location = 'wardrobe';
            await manager.save(tag);
            
            finalItem.rfidTagId = tag.id;
            finalItem.location = 'wardrobe';
            await manager.save(finalItem);
            
            console.log('[RFID] Successfully associated tag %s with item %s (%s)', tagId, itemId, finalItem.name);
            return { success: true, message: 'Tag associated successfully' };
        });
    }

    async getDeviceStatus(userId) {
        const device = await this.deviceRepo.findOne({ where: { userId } });
        if (!device) {
            return { hasDevice: false };
        }
        
        return {
            hasDevice: true,
            device: {
                id: device.id,
                name: device.deviceName,
                isOnline: device.isOnline,
                lastHeartbeat: device.lastHeartbeat
            }
        };
    }

    async getTags(userId) {
        return await this.tagRepo.find({
            where: { userId },
            relations: ['item'],
            select: {
                id: true,
                tagId: true,
                location: true,
                lastDetected: true,
                item: {
                    id: true,
                    name: true,
                    category: true
                }
            }
        });
    }
}