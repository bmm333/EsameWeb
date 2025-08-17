import { Injectable } from '@nestjs/common';
import { RfidDevice } from './entities/rfid-device.entity';
import { UserService } from '../user/user.service';

@Injectable()
@Dependencies([InjectRepository(RfidDevice),'RfidDeviceRepository'],
            [InjectRepository(RfidTag),'RfidTagRepository'],
            UserService)
export class RfidService {
    constructor(rfidDeviceRepository, rfidTagRepository, userService) {
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
}
