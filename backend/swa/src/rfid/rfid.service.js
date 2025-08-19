import { Injectable, Dependencies, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidDevice } from './entities/rfid-device.entity.js';
import { RfidTag } from './entities/rfid-tag.entity.js';
import { UserService } from '../user/user.service.js';

@Injectable()
export class RfidService {
  constructor(
    @InjectRepository(RfidDevice) rfidDeviceRepository,
    @InjectRepository(RfidTag) rfidTagRepository,
    @Inject(UserService) userService
  ) {
    this.rfidDeviceRepository = rfidDeviceRepository;
    this.rfidTagRepository = rfidTagRepository;
    this.userService = userService;
  }
    async registerDevice(userId,deviceData){
        const user=await this.userService.findOneById(userId);
        if(user.subscriptionTier==='free'&&!user.trial){
            throw new Error('RFID device requires premium subscription');
        }
        const exisitingDevice=await this.rfidDeviceRepository.findOne({
            where:{serialNumber:deviceData.serialNumber}
        });
        if(exisitingDevice){
            throw new Error('Device with this serial number already exists');
        }
        const device=this.rfidDeviceRepository.create({
            serialNumber:deviceData.serialNumber,
            deviceName:deviceData.deviceName||`Smart Wardrobe Device`,
            firmwareVersion:deviceData.firmwareVersion,
            status:'pairing',
            userId:userId,
            user:user
        });
        const savedDevice=await this.rfidDeviceRepository.save(device);
        await this.userService.update(userId,{
            hasRfidDevice:true,
            deviceSetupStatus:'pairing'
        });
        return savedDevice;
    }
    async configureDevice(deviceSerial,config){
        const device=await this.rfidDeviceRepository.findOne({
            where:{serialNumber:deviceSerial}
        });
        if(!device){
            throw new NotFoundException('Device not found');
        }
        await this.rfidDeviceRepository.update(device.id, {
            wifiConfig:config.wifiCredentials,
            settings:config.settings,
            status:'configured'
        });
        return {message:'Device configured successfully'};
    }
    async activateDevice(deviceSerial)
    {
        const device=await this.rfidDeviceRepository.findOne({
            where:{serialNumber:deviceSerial},
            relations:['user']
        });
        if(!device)
        {
            throw new NotFoundException('Device not found');
        }
        await this.rfidDeviceRepository.update(device.id, {
            status:'active',
            lastHeartbeat:new Date()
        });
        await this.userService.update(device.userId,{
            deviceSetupStatus:'active',
            deviceSetupCompletedAt:new Date()
        });
        return {message:'Device activated succesfully'};
    }
    async processRfidScan(scanData){
        const device=await this.rfidDeviceRepository.findOne({
            where:{serialNumber:scanData.deviceSerial},
            relations:['user']
        });
        if(!device)
        {
            throw new NotFoundException('Device not found');
        }
        await this.rfidDeviceRepository.update(device.id,{
            lastHeartbeat:new Date()
        });
        let tag=await this.rfidTagRepository.findOne({
            where:{tagId:scanData.tagId,deviceId:device.id}
        });
        if(!tag)
        {
            tag=this.rfidTagRepository.create({
                tagId:scanData.tagId,
                deviceId:device.id,
                userId:device.userId,
                location:scanData.event==='detected'?'in_wardrobe':'unknown',
                lastDetected:new Date()
            });
        }else{
            tag.location=scanData.event==='detected'?'in_wardrobe':'being_worn';
            tag.lastDetected=new Date();
        }await this.rfidTagRepository.save(tag);
        return {
            message:'Rfid scan Processed successfully',
                tag:tag
        };
    }
    async getUserDevice(userId)
    {
        return this.rfidDeviceRepository.find({
            where:{userId},
            relations:['tags']
        });
    }
    async getUserTags(userId)
    {
        return this.rfidTagRepository.find({
            where:{userId},
            relations:['device']
        });
    }
    async getDeviceStatus(userId)
    {
        const devices=await this.getUserDevice(userId);
        const tags=await this.getUserTags(userId);
        const activeDevices=devices.filter(d=>d.status==='active');
        const inWardrobe=tags.filter(t=>t.location==='in_wardrobe').length;
        const beingWorn=tags.filter(t=>t.location==='being_worn').length;
        return {
            deviceCount:devices.length,
            activeDevices:activeDevices.length,
            totalTags:tags.length,
            inWardrobe,
            beingWorn,
            lastSync:activeDevices[0]?.lastHeartbeat||null
        };
    }
    async updateDeviceHeartbeat(deviceSerial) {
        const device = await this.rfidDeviceRepository.findOne({
        where: { serialNumber: deviceSerial }
        });

        if (!device) {
        throw new NotFoundException('Device not found');
        }

        await this.rfidDeviceRepository.update(device.id, {
        lastHeartbeat: new Date(),
        status: 'active'
        });

        return { status: 'ok', timestamp: new Date() };
    }
}
