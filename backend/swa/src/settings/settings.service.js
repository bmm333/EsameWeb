import { Injectable, Dependencies, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { AuthService } from '../auth/auth.service.js';
import { MailingService } from '../mailing/mailing.service.js';

@Injectable()
@Dependencies(UserService, AuthService, MailingService)
export class SettingService {
    constructor(userService, authService, mailingService)
    {
        this.userService = userService;
        this.authService = authService;
        this.mailingService = mailingService;
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
    async changePassword(userId,passwordData)
    {
        return this.authService.changePassword(userId,passwordData.currentPassword,passwordData.newPassword);
    }
    async uploadProfilePhoto(userId,photoData)
    {
        await this.userService.uploadProfilePhoto(userId,{profilePicture:photoData.image});
        return {success:true,message:'Profile photo updated'};
    }
    async removeProfilePhoto(userId)
    {
        await this.userService.removeProfilePhoto(userId);
        return {success:true,message:'Profile photo removed'};
    }
    
    async resendVerificationEmail(userId)
    {
        const user=await this.userService.findOneById(userId);
        if(!user) throw new NotFoundException('User not found');
        if(user.isVerified)
        {
            throw new BadRequestException('Associated email is already verfied');
        }
        return this.authService.resendVerificationEmail(user.email);
    }
    
    async changeEmail(userId,emailData)
    {
        //asking for the password to confirm that the account owner is asking for an email change , as the email is used for password recovery  , and this could lead to an account takeover
        //preventing those who gain access to unlocked session from making changes without consent.
        const { newEmail, password } = emailData;
        const user = await this.userService.findOneById(userId);
        const bcrypt = await import('bcrypt');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Password is incorrect');
        }
        const existingUser = await this.userService.findOneByEmail(newEmail);
        if (existingUser) {
            throw new BadRequestException('Email is already in use');
        }
        await this.userService.update(userId, {
            email: newEmail,
            isVerified: false
        });
        await this.mailingService.sendEmailChangeNotification(user.email, newEmail);
        await this.mailingService.sendEmailVerification(newEmail, userId);
        const updatedUser = await this.userService.findOneById(userId);        
        return { success: true, message: 'Email updated. Please verify your new email address.' };
    }
    async resetToDefaults(userId, section) {
            const defaults = this.getDefaultSettings(section);
            await this.userService.update(userId, defaults);
            return { success: true, message: `${section} settings reset to defaults` };
    }


    async deleteUserAccount(userId) {
        await this.userService.delete(userId);
        return {success:true,message:'Account deleted Succesfully'};
    }

    getDefaultSettings(section) {
        const defaults = {
            preferences: {
                theme: 'system',
                temperatureUnit: 'celsius',
                enableAnimations: true,
                stylePreferences: [],
                colorPreferences: []
            },
            notifications: {
                emailOutfitSuggestions: true,
                emailWeeklyReport: false,
                emailPromotions: false,
                pushRFIDAlerts: true,
                pushOutfitReminders: true,
                pushWeatherAlerts: true,
                pushSystemUpdates: false,
                notificationTime: '07:00',
                weeklyReportDay: 'sunday',
                notificationDelay: 15
            },
            rfid: {
                scanInterval: 30,
                powerSavingMode: false,
                autoSync: true,
                notificationDelay: 15
            }
        };
        return defaults[section] || {};
    }
}
/*started designing user profile wrong, a refactoring should be taking place right now but, time is not promising so i will go with this design for now 
and will be more careful not to break clean architecture anymore*/