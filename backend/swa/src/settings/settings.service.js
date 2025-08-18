import { UserService } from "../user/user.service";

@Injectable()
@Dependencies(UserService)
export class SettingService {
    constructor(userService)
    {
        this.userService = userService;
    }
    async getUserSettings(userId){
        const user=await this.userService.findOneById(userId);
        if(!user) throw new NotFoundException('User not found');
        return{
            profile:{
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                phone:user.phoneNumber,
                profilePicture:user.profilePicture,
            },
            preferences:{
                stylePreferences:user.stylePreferences,
                colorPreferences:user.colorPreferences,
                theme:user.theme,
                displayOptions:user.displayOptions,
                location:user.location,
                temperatureUnit:user.temperatureUnit,
                enableAnimations:user.enableAnimations
            },
            notifications:{
                emailOutfitSuggestions: user.emailOutfitSuggestions,
                emailWeeklyReport: user.emailWeeklyReport,
                emailPromotions: user.emailPromotions,
                pushRFIDAlerts: user.pushRFIDAlerts,
                pushOutfitReminders: user.pushOutfitReminders,
                pushWeatherAlerts: user.pushWeatherAlerts,
                pushSystemUpdates: user.pushSystemUpdates,
                notificationTime: user.notificationTime,
                weeklyReportDay: user.weeklyReportDay,
                notificationDelay: user.notificationDelay,
            },
            rfid:{
                deviceId:user.deviceId,
                deviceStatus:user.deviceStatus,
                firmwareVersion:user.firmwareVersion,
                lastSync:user.deviceLastseen,
                scanInterval:user.scanInterval,
                powerSavingMode:user.powerSavingMode,
                autoSync:user.autoSync,
                tags:user.rfidTags,
            },
            account:{
                connectedAccounts:user.connectedAccounts,
                subscriptionTier:user.subscriptionTier,
                trial:user.trial,
                trialExpires:user.trialExpires,
            }
        };
    }
    async updateUserSettings(userId,settingsDto){
        await this.userService.update(userId,settingsDto);
        return {success:true};
    }
    
    async deleteUserAccount(userId) {
        await this.userService.delete(userId);
        return {success:true,message:'Account deleted Succesfully'};
    }
}