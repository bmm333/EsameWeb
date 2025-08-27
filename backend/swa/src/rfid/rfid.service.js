// src/rfid/rfid.service.js
import { Injectable, Dependencies, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidDevice } from './entities/rfid-device.entity.js';
import { RfidTag } from './entities/rfid-tag.entity.js';
import { UserService } from '../user/user.service.js';
import { NotificationService } from '../notification/notification.service.js';
import crypto from 'crypto';

@Injectable()
@Dependencies('RfidDeviceRepository', 'RfidTagRepository', UserService, NotificationService)
export class RfidService {
    constructor(
        @InjectRepository(RfidDevice) rfidDeviceRepository,
        @InjectRepository(RfidTag) rfidTagRepository,
        userService,
        notificationService
    ) {
        this.rfidDeviceRepository = rfidDeviceRepository;
        this.rfidTagRepository = rfidTagRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    //went the short route here 
    async registerDevice(userId, deviceData) {
        try {
            console.log(`Registering device for user ${userId}:`, deviceData.serialNumber);
            const user = await this.userService.findOneById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const existingUserDevice = await this.rfidDeviceRepository.findOne({
                where: { userId }
            });
            if (existingUserDevice) {
                throw new BadRequestException('User already has a registered device. Only 1 device per account allowed.');
            }
            const existingDevice = await this.rfidDeviceRepository.findOne({
                where: { serialNumber: deviceData.serialNumber }
            });

            if (!existingDevice) {
                throw new BadRequestException('Device serial not recognized. Provision the device in the backend first.');
            }
            if (existingDevice.userId && existingDevice.userId !== userId) {
                throw new BadRequestException('Device already registered to another account');
            }

            if (existingDevice.userId === userId) {
                return {
                    device: {
                        id: existingDevice.id,
                        serialNumber: existingDevice.serialNumber,
                        deviceName: existingDevice.deviceName,
                        status: existingDevice.status,
                        apiKey: existingDevice.apiKey
                    },
                    nextStep: existingDevice.status === 'active' ? 'ready' : 'bluetooth_pairing',
                    message: 'Device already registered for this account.'
                };
            }

            // Claim device for this user
            const apiKey = this.generateApiKey();
            await this.rfidDeviceRepository.update(existingDevice.id, {
                userId,
                apiKey,
                status: 'pairing',
                bluetoothConfig: Object.assign({}, existingDevice.bluetoothConfig, {
                    macAddress: deviceData.macAddress || existingDevice.bluetoothConfig?.macAddress,
                    pairedAt: new Date()
                })
            });

            const claimed = await this.rfidDeviceRepository.findOne({ where: { id: existingDevice.id } });

            await this.userService.updateUserRecord(userId, {
                hasRfidDevice: true,
                deviceSetupStatus: 'pairing',
                deviceId: claimed.serialNumber
            });

            console.log(`Device claimed: ${claimed.serialNumber}`);
            return {
                device: {
                    id: claimed.id,
                    serialNumber: claimed.serialNumber,
                    deviceName: claimed.deviceName,
                    status: claimed.status,
                    apiKey: apiKey
                },
                nextStep: 'bluetooth_pairing',
                message: 'Device registered. Use Web Bluetooth to send WiFi credentials and API key to device.'
            };
        } catch (error) {
            console.error('Error registering device:', error);
            throw error;
        }
    }

    async confirmWiFiConfiguration(deviceSerial, wifiConfig) {
        try {
            console.log(`Confirming WiFi configuration for device: ${deviceSerial}`);

            const device = await this.rfidDeviceRepository.findOne({
                where: { serialNumber: deviceSerial }
            });

            if (!device) {
                throw new NotFoundException('Device not found');
            }

            if (device.status !== 'pairing') {
                throw new BadRequestException('Device must be in pairing mode');
            }

            // Store WiFi config (basic encryption for demo)
            const encryptedConfig = {
                ssid: wifiConfig.ssid,
                security: wifiConfig.security || 'WPA2',
                configuredAt: new Date()
            };

            await this.rfidDeviceRepository.update(device.id, {
                wifiConfig: encryptedConfig,
                status: 'configuring',
                lastConfigured: new Date()
            });

            console.log(`WiFi configuration confirmed for device: ${deviceSerial}`);
            return {
                message: 'WiFi configuration confirmed. Device should come online shortly.',
                apiKey: device.apiKey,
                scanInterval: device.scanInterval
            };

        } catch (error) {
            console.error('Error confirming WiFi configuration:', error);
            throw error;
        }
    }

    async activateDevice(deviceSerial, ipAddress = null) {
        try {
            console.log(`Activating device: ${deviceSerial}`);

            const device = await this.rfidDeviceRepository.findOne({
                where: { serialNumber: deviceSerial },
                relations: ['user']
            });

            if (!device) {
                throw new NotFoundException('Device not found');
            }

            await this.rfidDeviceRepository.update(device.id, {
                status: 'active',
                ipAddress: ipAddress,
                isOnline: true,
                lastHeartbeat: new Date()
            });

            await this.userService.updateUserRecord(device.userId, {
                deviceSetupStatus: 'active',
                deviceSetupCompletedAt: new Date()
            });

            console.log(`Device activated: ${deviceSerial}`);
            return {
                message: 'Device activated successfully!',
                scanInterval: device.scanInterval,
                powerSavingMode: device.powerSavingMode
            };

        } catch (error) {
            console.error('Error activating device:', error);
            throw error;
        }
    }


    async validateDeviceApiKey(apiKey) {
        try {
            const device = await this.rfidDeviceRepository.findOne({
                where: { apiKey },
                relations: ['user']
            });

            if (!device) {
                throw new UnauthorizedException('Invalid API key');
            }

            if (device.status !== 'active') {
                throw new UnauthorizedException('Device not active');
            }

            return device;
        } catch (error) {
            console.error('Error validating API key:', error);
            throw new UnauthorizedException('Invalid API key');
        }
    }

    async processRealtimeRfidScan(apiKey, scanData) {
        try {
            console.log(`Processing RFID scan with API key: ${apiKey.substring(0, 8)}...`);
            const device = await this.validateDeviceApiKey(apiKey);
            await this.rfidDeviceRepository.update(device.id, {
                lastHeartbeat: new Date(),
                lastScan: new Date(),
                isOnline: true
            });

            const results = [];

            for (const tagData of scanData.detectedTags) {
                const result = await this.processTagDetection(device, tagData);
                results.push(result);
            }

            console.log(`Processed ${results.length} tag detections for device ${device.serialNumber}`);
            return {
                message: 'RFID scan processed successfully',
                device: device.serialNumber,
                processedTags: results.length,
                nextScanIn: device.scanInterval,
                results
            };

        } catch (error) {
            console.error('Error processing RFID scan:', error);
            throw error;
        }
    }

    async processTagDetection(device, tagData) {
        try {
            let tag = await this.rfidTagRepository.findOne({
                where: { tagId: tagData.tagId, deviceId: device.id },
                relations: ['item']
            });
            const now = new Date();
            if (!tag) {
                tag = this.rfidTagRepository.create({
                    tagId: tagData.tagId,
                    deviceId: device.id,
                    userId: device.userId,
                    status: 'detected',
                    location: 'wardrobe',
                    lastDetected: now,
                    lastSeen: now,
                    signalStrength: tagData.signalStrength || 0
                });

                console.log(`New RFID tag detected: ${tagData.tagId}`);
            } else {
                const wasOffline = tag.status === 'missing';
                
                tag.status = tagData.event === 'detected' ? 'detected' : 'missing';
                tag.lastDetected = tagData.event === 'detected' ? now : tag.lastDetected;
                tag.lastSeen = now;
                tag.signalStrength = tagData.signalStrength || tag.signalStrength;
                if (tagData.event === 'detected') {
                    tag.location = 'wardrobe';
                } else if (tagData.event === 'removed') {
                    tag.location = 'being_worn';
                    const recommendation = await this.recommendationService.generateRfidTriggeredRecommendation(
                    device.userId, 
                    item.id,
                    user.baseLocation
                    );
                }

                if (wasOffline && tagData.event === 'detected') {
                    console.log(`RFID tag back online: ${tagData.tagId}`);
                }
            }
            await this.rfidTagRepository.save(tag);
            if (tag.item && tagData.event === 'removed') {
                await this.triggerOutfitSuggestion(device.userId, tag.item.id);
            }

            return {
                tagId: tag.tagId,
                event: tagData.event,
                location: tag.location,
                hasItem: !!tag.item,
                itemName: tag.item?.name,
                signalStrength: tag.signalStrength
            };

        } catch (error) {
            console.error(`Error processing tag ${tagData.tagId}:`, error);
            return {
                tagId: tagData.tagId,
                error: error.message
            };
        }
    }

    async triggerOutfitSuggestion(userId, itemId) {
        try {
            console.log(`Triggering outfit suggestion for user ${userId}, item ${itemId}`);
            const result = await this.notificationService.sendRfidNotification(userId, itemId);
            if (result.success) {
                console.log(`Outfit suggestion sent to user ${userId}`);
            } else {
                console.log(`Outfit suggestion failed: ${result.message}`);
            }
            return result;
        } catch (error) {
            console.error('Error triggering outfit suggestion:', error);
        }
    }

    async updateDeviceHeartbeat(apiKey) {
        try {
            const device = await this.validateDeviceApiKey(apiKey);

            await this.rfidDeviceRepository.update(device.id, {
                lastHeartbeat: new Date(),
                isOnline: true
            });
            return {
                status: 'ok',
                timestamp: new Date(),
                nextScanInterval: device.scanInterval,
                powerSavingMode: device.powerSavingMode
            };

        } catch (error) {
            console.error('Error updating device heartbeat:', error);
            throw error;
        }
    }


    async getDeviceStatus(userId) {
        try {
            const device = await this.rfidDeviceRepository.findOne({
                where: { userId },
                relations: ['tags', 'tags.item']
            });

            if (!device) {
                return {
                    hasDevice: false,
                    setupRequired: true,
                    message: 'No RFID device registered. Complete device setup to get started.'
                };
            }
            const tags = device.tags;
            const activeTags = tags.filter(t => t.status === 'detected');
            const associatedTags = tags.filter(t => t.itemId);
            const inWardrobe = tags.filter(t => t.location === 'wardrobe').length;
            const beingWorn = tags.filter(t => t.location === 'being_worn').length;
            return {
                hasDevice: true,
                device: {
                    id: device.id,
                    serialNumber: device.serialNumber,
                    name: device.deviceName,
                    status: device.status,
                    isOnline: device.isOnline,
                    firmwareVersion: device.firmwareVersion,
                    lastHeartbeat: device.lastHeartbeat,
                    lastScan: device.lastScan,
                    ipAddress: device.ipAddress,
                    scanInterval: device.scanInterval,
                    powerSavingMode: device.powerSavingMode
                },
                statistics: {
                    totalTags: tags.length,
                    activeTags: activeTags.length,
                    associatedTags: associatedTags.length,
                    inWardrobe,
                    beingWorn,
                    missingTags: tags.filter(t => t.status === 'missing').length,
                    unassociatedTags: tags.filter(t => !t.itemId).length
                },
                recentActivity: tags
                    .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
                    .slice(0, 10)
                    .map(tag => ({
                        tagId: tag.tagId,
                        itemName: tag.item?.name || 'Unassociated',
                        location: tag.location,
                        lastSeen: tag.lastSeen,
                        status: tag.status,
                        signalStrength: tag.signalStrength
                    }))
            };
        } catch (error) {
            console.error('Error getting device status:', error);
            throw new BadRequestException('Failed to get device status');
        }
    }

    async getTagInfo(userId, tagId) {
        try {
            const tag = await this.rfidTagRepository.findOne({
                where: { tagId, userId },
                relations: ['item', 'device']
            });

            if (!tag) {
                throw new NotFoundException('RFID tag not found. Make sure the tag has been detected by your device first.');
            }

            return {
                tagId: tag.tagId,
                status: tag.status,
                location: tag.location,
                lastSeen: tag.lastSeen,
                signalStrength: tag.signalStrength,
                isAssociated: !!tag.itemId,
                currentItem: tag.item ? {
                    id: tag.item.id,
                    name: tag.item.name,
                    category: tag.item.category,
                    color: tag.item.color
                } : null,
                device: {
                    name: tag.device.deviceName,
                    serialNumber: tag.device.serialNumber
                }
            };

        } catch (error) {
            console.error('Error getting tag info:', error);
            throw error;
        }
    }
    async dissociateTagFromItem(userId, tagId) {
        try {
            console.log(`Dissociating tag ${tagId} from item for user ${userId}`);

            const tag = await this.rfidTagRepository.findOne({
                where: { tagId, userId },
                relations: ['item']
            });

            if (!tag) {
                throw new NotFoundException('RFID tag not found');
            }

            if (!tag.itemId) {
                throw new BadRequestException('Tag is not associated with any item');
            }

            const previousItem = tag.item;
            tag.itemId = null;
            await this.rfidTagRepository.save(tag);

            console.log(`Tag ${tagId} dissociated from item: ${previousItem?.name}`);
            
            return {
                success: true,
                message: 'RFID tag dissociated from item successfully',
                tag: {
                    tagId: tag.tagId,
                    previousItem: previousItem ? {
                        id: previousItem.id,
                        name: previousItem.name
                    } : null,
                    status: tag.status,
                    location: tag.location
                }
            };

        } catch (error) {
            console.error('Error dissociating tag from item:', error);
            throw error;
        }
    }

    async associateTagWithItem(userId, tagId, itemId, forceOverride = false) { //if the tag is already associated , the frontend will recive the payload with requiresConfirmation = true, and if user wants to override it, they can set forceOverride to true
        try {
            console.log(`Associating tag ${tagId} with item ${itemId} for user ${userId}`);
            const tag = await this.rfidTagRepository.findOne({
                where: { tagId, userId },
                relations: ['device', 'item']
            });

            if (!tag) {
                throw new NotFoundException('RFID tag not found. Please scan the tag first.');
            }
            if (tag.item && tag.itemId !== itemId && !forceOverride) {
                return {
                    requiresConfirmation: true,
                    conflict: 'tag_already_assigned',
                    message: `RFID tag ${tagId} is already associated with "${tag.item.name}". Do you want to reassign it?`,
                    currentAssignment: {
                        tagId: tag.tagId,
                        itemId: tag.itemId,
                        itemName: tag.item.name,
                        assignedAt: tag.updatedAt
                    },
                    newAssignment: {
                        tagId: tagId,
                        itemId: itemId
                    }
                };
            }
            const existingTag = await this.rfidTagRepository.findOne({
                where: { itemId, userId },
                relations: ['item']
            });
            if (existingTag && existingTag.tagId !== tagId && !forceOverride) {
                return {
                    requiresConfirmation: true,
                    conflict: 'item_already_has_tag',
                    message: `Item already has RFID tag "${existingTag.tagId}" assigned. Do you want to replace it?`,
                    currentAssignment: {
                        tagId: existingTag.tagId,
                        itemId: itemId,
                        assignedAt: existingTag.updatedAt
                    },
                    newAssignment: {
                        tagId: tagId,
                        itemId: itemId
                    }
                };
            }
            if (forceOverride) {
                if (tag.itemId) {
                    console.log(`Removing old association: tag ${tagId} from item ${tag.itemId}`);
                }
                if (existingTag && existingTag.tagId !== tagId) {
                    console.log(`Removing old tag ${existingTag.tagId} from item ${itemId}`);
                    existingTag.itemId = null;
                    await this.rfidTagRepository.save(existingTag);
                }
            }
            tag.itemId = itemId;
            const savedTag = await this.rfidTagRepository.save(tag);
            console.log(`Tag ${tagId} successfully associated with item ${itemId}`);
            return {
                success: true,
                message: 'RFID tag associated with item successfully',
                association: {
                    tagId: savedTag.tagId,
                    itemId: itemId,
                    location: savedTag.location,
                    status: savedTag.status,
                    associatedAt: new Date()
                }
            };
        } catch (error) {
            console.error('Error associating tag with item:', error);
            throw error;
        }
    }

    async getUnassociatedTags(userId) {
        try {
            const tags = await this.rfidTagRepository.find({
                where: { userId, itemId: null },
                order: { lastDetected: 'DESC' }
            });
            return tags.map(tag => ({
                id: tag.id,
                tagId: tag.tagId,
                status: tag.status,
                location: tag.location,
                lastDetected: tag.lastDetected,
                lastSeen: tag.lastSeen,
                signalStrength: tag.signalStrength
            }));
        } catch (error) {
            console.error('Error getting unassociated tags:', error);
            throw new BadRequestException('Failed to get unassociated tags');
        }
    }

    generateApiKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    async getUserTags(userId) {
        try {
            return await this.rfidTagRepository.find({
                where: { userId },
                relations: ['device', 'item'],
                order: { lastSeen: 'DESC' }
            });
        } catch (error) {
            console.error('Error getting user tags:', error);
            throw new BadRequestException('Failed to get user tags');
        }
    }
}