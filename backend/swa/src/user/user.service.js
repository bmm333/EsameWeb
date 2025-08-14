import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileSetupDto } from './dto/user-profile-setup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@Inject(getRepositoryToken(User)) userRepository) {
    this.userRepository = userRepository;
  }

  async findAll() {
    try {
      return await this.userRepository.find({
        select: [
          'id', 'firstName', 'lastName', 'email', 'phoneNumber',
          'isVerified', 'subscriptionTier', 'trial', 'trialExpires',
          'createdAt', 'updatedAt', 'lastLoginAt'
        ]
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
          'dateOfBirth', 'gender', 'stylePreferences', 'colorPreferences',
          'favoriteShops', 'sizes', 'primarySize', 'lifestyle', 'occasions', 'riskTolerance',
          'sustainabilityFocus', 'avoidMaterials',
          'location', 'climate', 'enableRecommendations',
          'enableWeatherNotifications', 'enableOutfitReminders',
          'morningNotificationTime', 'subscriptionTier', 'trial',
          'trialExpires', 'isVerified', 'profilePicture',
          'createdAt', 'updatedAt', 'lastLoginAt'
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
        where: { email: email.toLowerCase() } 
      });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new BadRequestException('Error finding user by email');
    }
  }

  async findByGoogleId(googleId) {
    try {
      return await this.userRepository.findOne({ 
        where: { googleId } 
      });
    } catch (error) {
      console.error(`Error finding user by Google ID ${googleId}:`, error);
      throw new BadRequestException('Error finding user by Google ID');
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
        firstName: dto.firstName,
        lastName: dto.lastName || '',
        email: dto.email,
        password: hashedPassword,
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
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

  async setupUserProfile(userId, profileData) {
    try {
      const user = await this.findOneById(userId);
      
      const dto = plainToClass(UserProfileSetupDto, profileData);
      const validationErrors = await validate(dto);
      
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(error => Object.values(error.constraints))
          .flat();
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const updateData = {
        stylePreferences: dto.stylePreferences,
        colorPreferences: dto.colorPreferences,
        favoriteShops: dto.favoriteShops,
        sizes: dto.sizes,
        primarySize: dto.primarySize,
        lifestyle: dto.lifestyle,
        occasions: dto.occasions,
        riskTolerance: dto.riskTolerance || 'moderate',
        sustainabilityFocus: dto.sustainabilityFocus || false,
        avoidMaterials: dto.avoidMaterials,
        location: dto.location,
        climate: dto.climate,
        enableRecommendations: dto.enableRecommendations ?? true,
        enableWeatherNotifications: dto.enableWeatherNotifications ?? true,
        enableOutfitReminders: dto.enableOutfitReminders || false,
        morningNotificationTime: dto.morningNotificationTime,
        updatedAt: new Date()
      };
      
      await this.userRepository.update(userId, updateData);
      return this.findOneById(userId);
      
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error setting up profile for user ${userId}:`, error);
      throw new BadRequestException('Error setting up user profile');
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const user = await this.findOneById(userId);
      
      const updateData = {
        stylePreferences: preferences.stylePreferences || user.stylePreferences,
        colorPreferences: preferences.colorPreferences || user.colorPreferences,
        budgetRange: preferences.budgetRange || user.budgetRange,
        riskTolerance: preferences.riskTolerance || user.riskTolerance,
        sustainabilityFocus: preferences.sustainabilityFocus ?? user.sustainabilityFocus,
        favoriteShops: preferences.favoriteShops || user.favoriteShops,
        avoidMaterials: preferences.avoidMaterials || user.avoidMaterials,
        updatedAt: new Date()
      };
      
      await this.userRepository.update(userId, updateData);
      return this.findOneById(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating preferences for user ${userId}:`, error);
      throw new BadRequestException('Error updating user preferences');
    }
  }

  async updateNotificationSettings(userId, settings) {
    try {
      const user = await this.findOneById(userId);
      
      const updateData = {
        enableRecommendations: settings.enableRecommendations ?? user.enableRecommendations,
        enableWeatherNotifications: settings.enableWeatherNotifications ?? user.enableWeatherNotifications,
        enableOutfitReminders: settings.enableOutfitReminders ?? user.enableOutfitReminders,
        morningNotificationTime: settings.morningNotificationTime || user.morningNotificationTime,
        updatedAt: new Date()
      };
      
      await this.userRepository.update(userId, updateData);
      return this.findOneById(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating notification settings for user ${userId}:`, error);
      throw new BadRequestException('Error updating notification settings');
    }
  }
}