import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserProfileSetupDto } from './dto/user-profile-setup.dto.js';
import { UserStylePreference } from './entities/user-style-preferences.entity.js';
import { UserColorPreference } from './entities/user-color-preferences.entity.js';
import { UserFavoriteShop } from './entities/user-shop.entity.js';
import { UserSize } from './entities/user-size.entity.js';
import { UserLifestyle } from './entities/user-lifestyle.entity.js';
import { UserOccasion } from './entities/user-occasion.entity.js';
import { UserAvoidMaterial } from './entities/user-avoid.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(getRepositoryToken(User)) userRepository,
    @Inject(getRepositoryToken(UserStylePreference)) stylePreferenceRepository,
    @Inject(getRepositoryToken(UserColorPreference)) colorPreferenceRepository,
    @Inject(getRepositoryToken(UserFavoriteShop)) favoriteShopRepository,
    @Inject(getRepositoryToken(UserSize)) userSizeRepository,
    @Inject(getRepositoryToken(UserLifestyle)) userLifestyleRepository,
    @Inject(getRepositoryToken(UserOccasion)) userOccasionRepository,
    @Inject(getRepositoryToken(UserAvoidMaterial)) userAvoidMaterialRepository
  ) {
    this.userRepository = userRepository;
    this.stylePreferenceRepository = stylePreferenceRepository;
    this.colorPreferenceRepository = colorPreferenceRepository;
    this.favoriteShopRepository = favoriteShopRepository;
    this.userSizeRepository = userSizeRepository;
    this.userLifestyleRepository = userLifestyleRepository;
    this.userOccasionRepository = userOccasionRepository;
    this.userAvoidMaterialRepository = userAvoidMaterialRepository;
  }

  async findAll() {
    try {
      return await this.userRepository.find({
        select: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isVerified']
      });
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new BadRequestException('Error retrieving users');
    }
  }

  async findOneById(id) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id', 'firstName', 'lastName', 'email', 'phoneNumber',
          'dateOfBirth', 'gender', 'riskTolerance',
          'sustainabilityFocus', 'location', 'climate', 
          'enableRecommendations', 'enableWeatherNotifications', 
          'enableOutfitReminders', 'morningNotificationTime', 
          'subscriptionTier', 'trial', 'trialExpires', 'isVerified', 
          'profilePicture', 'profileSetupCompleted', 'profileSetupCompletedAt',
          'createdAt', 'updatedAt', 'lastLoginAt', 'primarySize',
          'skinTone', 'deviceSetupStatus', 'deviceSetupCompletedAt'
        ],
        relations: [
          'stylePreferences', 'colorPreferences', 'favoriteShops',
          'sizes', 'lifestyles', 'occasions', 'avoidMaterials'
        ]
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error finding user by id ${id}:`, error);
      throw new BadRequestException('Error retrieving user');
    }
  }

  async findByEmail(email) {
    try {
      return await this.userRepository.findOne({
        where: { email },
        select: [
          'id', 'firstName', 'lastName', 'email', 'password',
          'isVerified', 'profileSetupCompleted', 'subscriptionTier',
          'trial', 'trialExpires', 'failedLoginAttempts', 'lockedUntil'
        ]
      });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new BadRequestException('Error finding user');
    }
  }

  async findByGoogleId(googleId) {
    try {
      return await this.userRepository.findOne({
        where: { googleId },
        select: ['id', 'email', 'firstName', 'lastName', 'profileSetupCompleted']
      });
    } catch (error) {
      console.error(`Error finding user by Google ID:`, error);
      throw new BadRequestException('Error finding user');
    }
  }

  async createUser(userData) {
    try {
      const dto = plainToClass(CreateUserDto, userData);
      const validationErrors = await validate(dto);
      
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(error => Object.values(error.constraints))
          .flat();
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const trialExpires = new Date();
      trialExpires.setDate(trialExpires.getDate() + 30);

      const newUser = this.userRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        password: hashedPassword,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        verificationToken: userData.verificationToken,
        verificationTokenExpires: userData.verificationTokenExpires,
        passwordChangedAt: userData.passwordChangedAt,
        trial: true,
        trialExpires,
        subscriptionTier: 'free',
        enableRecommendations: true,
        enableWeatherNotifications: true,
        riskTolerance: 'moderate',
        provider: 'local',
        isVerified: false
      });

      const savedUser = await this.userRepository.save(newUser);
      
      const { password, ...userResponse } = savedUser;
      return userResponse;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating user entity:', error);
      throw new BadRequestException('Error creating user entity');
    }
  }

  async updateUserRecord(userId, updateData) {
    try {
      //updating only scalar fields, not relations
      const { stylePreferences, colorPreferences, favoriteShops, sizes, lifestyles, occasions, avoidMaterials, ...scalarData } = updateData;
      
      await this.userRepository.update(userId, {
        ...scalarData,
        updatedAt: new Date()
      });
      return this.findOneById(userId);
    } catch (error) {
      console.error(`Error updating user record ${userId}:`, error);
      throw new BadRequestException('Error updating user record');
    }
  }

  async setupUserProfile(userId, profileData) {
    try {
      console.log('🔧 setupUserProfile called with userId:', userId);
      console.log('🔧 setupUserProfile profileData:', JSON.stringify(profileData, null, 2));
      
      const user = await this.findOneById(userId);
      if (user.profileSetupCompleted) {
        throw new BadRequestException('Profile setup already completed');
      }

      const dto = plainToClass(UserProfileSetupDto, profileData);
      console.log('🔧 DTO after transformation:', JSON.stringify(dto, null, 2));
      
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        console.error('🔧 Validation errors:', validationErrors);
        const errorMessages = validationErrors
          .map(error => {
            console.error('🔧 Field:', error.property, 'Constraints:', error.constraints);
            return Object.values(error.constraints || {});
          })
          .flat();
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      // Prepare scalar update data with proper defaults
      const scalarUpdateData = {
        firstName: dto.firstName || user.firstName,
        lastName: dto.lastName || user.lastName,
        gender: dto.gender || null,
        dateOfBirth: dto.dateOfBirth || null,
        phoneNumber: dto.phoneNumber || null,
        location: dto.location || null,
        climate: dto.climate || null,
        primarySize: dto.primarySize || null,
        skinTone: dto.skinTone || null,
        riskTolerance: dto.riskTolerance || 'moderate',
        sustainabilityFocus: dto.sustainabilityFocus ?? false,
        enableRecommendations: dto.enableRecommendations ?? true,
        enableWeatherNotifications: dto.enableWeatherNotifications ?? true,
        enableOutfitReminders: dto.enableOutfitReminders ?? false,
        morningNotificationTime: dto.morningNotificationTime || null,
        profilePicture: dto.profilePicture || null,
        profileSetupCompleted: true,
        profileSetupCompletedAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🔧 Scalar update data:', JSON.stringify(scalarUpdateData, null, 2));
      
      // Update user record
      await this.userRepository.update(userId, scalarUpdateData);
      
      // Handle user relations (preferences)
      await this.handleUserRelations(userId, dto);
      
      return this.findOneById(userId);
    } catch (error) {
      console.error('🔧 setupUserProfile error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error setting up user profile for user ${userId}:`, error);
      throw new BadRequestException(`Error setting up user profile: ${error.message}`);
    }
  }

  async handleUserRelations(userId, dto) {
    try {
      console.log('🔧 handleUserRelations called with userId:', userId);
      console.log('🔧 handleUserRelations dto:', JSON.stringify(dto, null, 2));
      
      // Style Preferences
      if (dto.stylePreferences && Array.isArray(dto.stylePreferences)) {
        console.log('🔧 Processing style preferences:', dto.stylePreferences);
        await this.stylePreferenceRepository.delete({ userId });
        if (dto.stylePreferences.length > 0) {
          const stylePrefs = dto.stylePreferences.map(style => 
            this.stylePreferenceRepository.create({
              userId,
              style: typeof style === 'string' ? style : style.style || style.styleName,
              priority: 1
            })
          );
          await this.stylePreferenceRepository.save(stylePrefs);
        }
      }
      
      // Color Preferences
      if (dto.colorPreferences && Array.isArray(dto.colorPreferences)) {
        console.log('🔧 Processing color preferences:', dto.colorPreferences);
        await this.colorPreferenceRepository.delete({ userId });
        if (dto.colorPreferences.length > 0) {
          const colorPrefs = dto.colorPreferences.map(color => 
            this.colorPreferenceRepository.create({
              userId,
              color: typeof color === 'string' ? color : color.color || color.colorName,
              hexCode: typeof color === 'object' ? color.hexCode : null,
              preference: 'liked'
            })
          );
          await this.colorPreferenceRepository.save(colorPrefs);
        }
      }
      
      // Favorite Shops
      if (dto.favoriteShops && Array.isArray(dto.favoriteShops)) {
        console.log('🔧 Processing favorite shops:', dto.favoriteShops);
        await this.favoriteShopRepository.delete({ userId });
        if (dto.favoriteShops.length > 0) {
          const shopPrefs = dto.favoriteShops.map(shop => 
            this.favoriteShopRepository.create({
              userId,
              shopName: typeof shop === 'string' ? shop : shop.shopName || shop.name,
              category: typeof shop === 'object' ? shop.category : null,
              rating: typeof shop === 'object' ? shop.rating : null
            })
          );
          await this.favoriteShopRepository.save(shopPrefs);
        }
      }
      
      // Sizes
      if (dto.sizes && Array.isArray(dto.sizes)) {
        console.log('🔧 Processing sizes:', dto.sizes);
        await this.userSizeRepository.delete({ userId });
        if (dto.sizes.length > 0) {
          const sizePrefs = dto.sizes.map(size => 
            this.userSizeRepository.create({
              userId,
              category: typeof size === 'object' ? size.category : 'general',
              size: typeof size === 'string' ? size : size.size,
              brand: typeof size === 'object' ? size.brand : null
            })
          );
          await this.userSizeRepository.save(sizePrefs);
        }
      }
      
      // Lifestyles
      if (dto.lifestyles && Array.isArray(dto.lifestyles)) {
        console.log('🔧 Processing lifestyles:', dto.lifestyles);
        await this.userLifestyleRepository.delete({ userId });
        if (dto.lifestyles.length > 0) {
          const lifestylePrefs = dto.lifestyles.map(lifestyle => 
            this.userLifestyleRepository.create({
              userId,
              lifestyle: typeof lifestyle === 'string' ? lifestyle : lifestyle.lifestyle || lifestyle.lifestyleName,
              percentage: typeof lifestyle === 'object' ? lifestyle.percentage : 100
            })
          );
          await this.userLifestyleRepository.save(lifestylePrefs);
        }
      }
      
      // Occasions
      if (dto.occasions && Array.isArray(dto.occasions)) {
        console.log('🔧 Processing occasions:', dto.occasions);
        await this.userOccasionRepository.delete({ userId });
        if (dto.occasions.length > 0) {
          const occasionPrefs = dto.occasions.map(occasion => 
            this.userOccasionRepository.create({
              userId,
              occasion: typeof occasion === 'string' ? occasion : occasion.occasion || occasion.occasionName,
              frequency: typeof occasion === 'object' ? occasion.frequency : 'monthly'
            })
          );
          await this.userOccasionRepository.save(occasionPrefs);
        }
      }
      
      // Avoid Materials
      if (dto.avoidMaterials && Array.isArray(dto.avoidMaterials)) {
        console.log('🔧 Processing avoid materials:', dto.avoidMaterials);
        await this.userAvoidMaterialRepository.delete({ userId });
        if (dto.avoidMaterials.length > 0) {
          const avoidMaterialPrefs = dto.avoidMaterials.map(material => 
            this.userAvoidMaterialRepository.create({
              userId,
              material: typeof material === 'string' ? material : material.material || material.materialName,
              reason: typeof material === 'object' ? material.reason : 'preference',
              notes: typeof material === 'object' ? material.notes : null
            })
          );
          await this.userAvoidMaterialRepository.save(avoidMaterialPrefs);
        }
      }
      
      console.log('🔧 handleUserRelations completed successfully');
    } catch (error) {
      console.error('🔧 handleUserRelations error:', error);
      throw new BadRequestException(`Error saving user preferences: ${error.message}`);
    }
  }
  async updateLastLogin(userId) {
    try {
      await this.userRepository.update(userId, { 
        lastLoginAt: new Date() 
      });
    } catch (error) {
      console.error(`Error updating last login for user ${userId}:`, error);
    }
  }
  async verifyUser(userId) {
    try {
      await this.userRepository.update(userId, {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date()
      });
      return this.findOneById(userId);
    } catch (error) {
      console.error(`Error verifying user ${userId}:`, error);
      throw new BadRequestException('Error verifying user');
    }
  }
  async setVerificationToken(userId, token, expires) {
    try {
      await this.userRepository.update(userId, {
        verificationToken: token,
        verificationTokenExpires: expires,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error setting verification token for user ${userId}:`, error);
      throw new BadRequestException('Error setting verification token');
    }
  }
  async setResetPasswordToken(userId, token, expires) {
    try {
      await this.userRepository.update(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error setting reset password token for user ${userId}:`, error);
      throw new BadRequestException('Error setting reset password token');
    }
  }
  async updateNotificationSettings(userId, settings) {
    try {
      await this.userRepository.update(userId, {
        enableRecommendations: settings.enableRecommendations,
        enableWeatherNotifications: settings.enableWeatherNotifications,
        enableOutfitReminders: settings.enableOutfitReminders,
        morningNotificationTime: settings.morningNotificationTime,
        updatedAt: new Date()
      });
      return this.findOneById(userId);
    } catch (error) {
      console.error(`Error updating notification settings for user ${userId}:`, error);
      throw new BadRequestException('Error updating notification settings');
    }
  }
  async findByVerificationToken(token) {
    try {
      return await this.userRepository.findOne({
        where: { verificationToken: token },
        select: ['id', 'email', 'isVerified', 'verificationTokenExpires']
      });
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw new BadRequestException('Error finding user');
    }
  }
  async findByResetToken(token) {
    try {
      return await this.userRepository.findOne({
        where: { resetPasswordToken: token },
        select: ['id', 'email', 'resetPasswordExpires']
      });
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw new BadRequestException('Error finding user');
    }
  }
  async checkProfileSetupStatus(userId) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'profileSetupCompleted', 'profileSetupCompletedAt']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        profileSetupCompleted: user.profileSetupCompleted || false,
        profileSetupCompletedAt: user.profileSetupCompletedAt
      };
    } catch (error) {
      console.error('UserService checkProfileSetupStatus error:', error);
      throw error;
    }
  }
  async remove(userId) {
    try {
      await this.userRepository.delete(userId);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new BadRequestException('Error deleting user');
    }
  }
}