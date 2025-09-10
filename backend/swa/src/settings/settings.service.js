import { Injectable, Dependencies, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { AuthService } from '../auth/auth.service.js';
import { MailingService } from '../mailing/mailing.service.js';

@Injectable()
@Dependencies(UserService, AuthService, MailingService)
export class SettingService {
    constructor(userService, authService, mailingService) {
        this.userService = userService;
        this.authService = authService;
        this.mailingService = mailingService;
        this.emailChangeInProgress = new Map();
    }

    async getUserSettings(userId) {
        const user = await this.userService.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        
        return {
            profile: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                defaultWeatherLocation: user.location
            },
            preferences: {
                theme: 'system',
                temperatureUnit: 'celsius',
                stylePreferences: user.stylePreferences || [],
                colorPreferences: user.colorPreferences || []
            },
            account: {
                subscriptionTier: user.subscriptionTier,
                trial: user.trial,
                trialExpires: user.trialExpires,
                isVerified: user.isVerified
            }
        };
    }

    async updateUserSettings(userId, settings) {
        const updateData = {};
        if (settings.profile) {
            if (settings.profile.firstName) updateData.firstName = settings.profile.firstName;
            if (settings.profile.lastName) updateData.lastName = settings.profile.lastName;
            if (settings.profile.phoneNumber !== undefined) updateData.phoneNumber = settings.profile.phoneNumber;
            if (settings.profile.profilePicture !== undefined) updateData.profilePicture = settings.profile.profilePicture;
            if (settings.profile.defaultWeatherLocation !== undefined) {
                updateData.location = settings.profile.defaultWeatherLocation;
            }
        }
        
        if (settings.preferences) {
            if (settings.preferences.stylePreferences !== undefined) {
                updateData.stylePreferences = settings.preferences.stylePreferences;
            }
            if (settings.preferences.colorPreferences !== undefined) {
                updateData.colorPreferences = settings.preferences.colorPreferences;
            }
            if (settings.preferences.weatherLocation !== undefined) {
                updateData.location = settings.preferences.weatherLocation;
            }
        }
        if (Object.keys(updateData).length > 0) {
            await this.userService.updateUserRecord(userId, updateData);
        }
        
        return { success: true, message: 'Settings updated successfully' };
    }

    async changePassword(userId, passwordData) {
        const { currentPassword, newPassword } = passwordData;
        
        if (!currentPassword || !newPassword) {
            throw new BadRequestException('Current password and new password are required');
        }

        if (newPassword.length < 8) {
            throw new BadRequestException('New password must be at least 8 characters long');
        }

        try {
            return await this.authService.changePassword(userId, currentPassword, newPassword);
        } catch (error) {
            console.error('Password change error in settings service:', error);
            throw new BadRequestException('Password change failed: ' + error.message);
        }
    }

    async changeEmail(userId, emailData) {
        if (this.emailChangeInProgress.has(userId)) {
            console.log(`Email change already in progress for user ${userId}`);
            throw new BadRequestException('Email change already in progress. Please wait.');
        }
        this.emailChangeInProgress.set(userId, true);
        try {
            const { newEmail, password } = emailData;
            
            if (!newEmail || !password) {
                throw new BadRequestException('New email and password are required');
            }
            console.log(`Starting email change for user ${userId} to ${newEmail}`);
            const user = await this.userService.findOneByIdWithPassword(userId);
            if (!user) throw new NotFoundException('User not found');
            const bcrypt = await import('bcrypt');
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Current password is incorrect');
            }
            const existingUser = await this.userService.findByEmail(newEmail);
            if (existingUser && existingUser.id !== userId) {
                throw new BadRequestException('Email is already in use');
            }
            const crypto = await import('crypto');
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            console.log(`Generated verification token for user ${userId}:`, verificationToken);
            await this.userService.updateUserRecord(userId, {
                email: newEmail,
                isVerified: false,
                verificationToken: verificationToken,
                verificationTokenExpires: tokenExpires
            });

            console.log(`Database updated for user ${userId} with token:`, verificationToken);
            try {
                console.log(`Sending verification email to ${newEmail} with token:`, verificationToken);
                
                await this.mailingService.sendVerificationEmail({ 
                    email: newEmail, 
                    firstName: user.firstName 
                }, verificationToken);
                
                console.log(`Verification email sent successfully to ${newEmail}`);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }
            
            if (user.email !== newEmail) {
                try {
                    await this.mailingService.sendEmailChangeNotification(user.email, newEmail);
                    console.log(`Change notification sent to old email: ${user.email}`);
                } catch (emailError) {
                    console.error('Failed to send change notification:', emailError);
                }
            }

            console.log(`Email change completed successfully for user ${userId}`);

            return { 
                success: true, 
                message: 'Email updated successfully. Please check your new email for verification.' 
            };
            
        } finally {
            this.emailChangeInProgress.delete(userId);
            console.log(`Cleared email change lock for user ${userId}`);
        }
    }

    async resetToDefaults(userId, section) {
        const defaults = this.getDefaultSettings(section);
        if (!defaults) {
            throw new BadRequestException(`Invalid section: ${section}`);
        }
        
        return { 
            success: true, 
            message: `${section} settings reset to defaults successfully` 
        };
    }

        async deleteUserAccount(userId) {
        const user = await this.userService.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        await this.userService.remove(userId);
        if (user.email) {
            try {
                await this.mailingService.sendAccountDeletionConfirmation(user.email, user.firstName);
            } catch (emailError) {
                console.error('Failed to send account deletion confirmation:', emailError);
            }
        }
    
        return { 
            success: true, 
            message: 'Account deleted successfully',
            shouldLogout: true 
        };
    }

    getDefaultSettings(section) {
        const defaults = {
            preferences: {
                stylePreferences: [],
                colorPreferences: []
            }
        };
        
        return defaults[section] || null;
    }
}