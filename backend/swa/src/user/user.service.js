import { Injectable, BadRequestException, NotFoundException, Inject,Dependencies } from '@nestjs/common';
import { getRepositoryToken,InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { User } from './entities/user.entity.js'
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserProfileSetupDto } from './dto/user-profile-setup.dto.js';
import { UserStylePreference } from './entities/user-style-preferences.entity.js';
import { UserColorPreference } from './entities/user-color-preferences.entity.js';
import { UserLifestyle } from './entities/user-lifestyle.entity.js';
import { UserOccasion } from './entities/user-occasion.entity.js';
import {MediaService} from '../media/media.service.js';

@Injectable()
export class UserService {
  constructor(
    @Inject(getRepositoryToken(User)) userRepository,
    @Inject(getRepositoryToken(UserStylePreference)) stylePreferenceRepository,
    @Inject(getRepositoryToken(UserColorPreference)) colorPreferenceRepository,
    @Inject(getRepositoryToken(UserLifestyle)) userLifestyleRepository,
    @Inject(getRepositoryToken(UserOccasion)) userOccasionRepository,
    @Inject(MediaService)mediaService
  ) {
    this.userRepository = userRepository;
    this.stylePreferenceRepository = stylePreferenceRepository;
    this.colorPreferenceRepository = colorPreferenceRepository;
    this.userLifestyleRepository = userLifestyleRepository;
    this.userOccasionRepository = userOccasionRepository;
    this.mediaService = mediaService;
  }

  async findOneByIdWithPassword(id) {
    try {
      console.log('UserService: Finding user by ID with password:', id);
      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) }
      });
      
      console.log('UserService: User found with password:', { 
        id: user?.id, 
        email: user?.email, 
        hasPassword: !!user?.password 
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

  async updatePassword(userId, hashedPassword) {
    try {
      console.log('UserService: Updating password for user:', userId);
      
      const result = await this.userRepository.update(userId, {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      });
      
      console.log('UserService: Password update result:', result);
      return this.findOneById(userId);
    } catch (error) {
      console.error(`Error updating password for user ${userId}:`, error);
      throw new BadRequestException('Error updating password');
    }
  }
  async findOneById(id) {
    try {
        console.log(`Finding user by id ${id}`);
        
        const user = await this.userRepository.findOneBy({ id });
        
        if (!user) {
            console.log(`User with id ${id} not found`);
            return null;
        }

        console.log(`User found: ${user.email}`);
        return user;
    } catch (error) {
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

          const newUser = this.userRepository.create({
              firstName: userData.firstName,
              lastName: userData.lastName || '',
              email: userData.email,
              password: dto.password,
              gender: userData.gender,
              verificationToken: userData.verificationToken,
              verificationTokenExpires: userData.verificationTokenExpires,
              passwordChangedAt: userData.passwordChangedAt,
              trial: userData.trial || false,
              trialExpires: userData.trialExpires,
              subscriptionTier: userData.subscriptionTier || 'free',
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
      const { stylePreferences, colorPreferences, lifestyles, occasions, defaultWeatherLocation, ...scalarData } = updateData;
      if (defaultWeatherLocation !== undefined) {
        scalarData.location = defaultWeatherLocation;
      }
      
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

  async setupUserProfile(userId, profileData, profilePictureFile = null) {
    try {
      const user = await this.findOneById(userId);
      if (user.profileSetupCompleted) {
        throw new BadRequestException('Profile setup already completed');
      }
      const dto = plainToClass(UserProfileSetupDto, profileData);
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(error => Object.values(error.constraints || {}))
          .flat();
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }

      let profilePictureUrl = dto.profilePicture || null;
      if (profilePictureFile) {
        const uploadResult = await this.mediaService.uploadImage(
          userId,
          profilePictureFile,
          { folder: 'profiles', removeBackground: false }
        );
        profilePictureUrl = uploadResult.media.url;
      }

      const scalarUpdateData = {
        firstName: dto.firstName || user.firstName,
        lastName: dto.lastName || user.lastName,
        gender: dto.gender || null,
        location: dto.location || null,
        profilePicture: profilePictureUrl,
        profileSetupCompleted: true,
        profileSetupCompletedAt: new Date(),
        updatedAt: new Date()
      };

      await this.userRepository.update(userId, scalarUpdateData);
      await this.handleUserRelations(userId, dto);
      return this.findOneById(userId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error setting up user profile: ${error.message}`);
    }
  }

  async handleUserRelations(userId, dto) {
    try {
      if (dto.stylePreferences && Array.isArray(dto.stylePreferences)) {
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
      if (dto.colorPreferences && Array.isArray(dto.colorPreferences)) {
        await this.colorPreferenceRepository.delete({ userId });
        if (dto.colorPreferences.length > 0) {
          const colorPrefs = dto.colorPreferences.map(color => 
            this.colorPreferenceRepository.create({
              userId,
              color: typeof color === 'string' ? color : color.color || color.colorName,
              hexCode: typeof color === 'object' ? color.hexCode : null,
              preference: this.mapPreferenceToInteger(color.preference)
            })
          );
          await this.colorPreferenceRepository.save(colorPrefs);
        }
      }
      if (dto.lifestyles && Array.isArray(dto.lifestyles)) {
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
      if (dto.occasions && Array.isArray(dto.occasions)) {
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
    } catch (error) {
      throw new BadRequestException(`Error saving user preferences: ${error.message}`);
    }
  }
  mapPreferenceToInteger(preference) {
  const preferenceMap = {
    liked: 1,
    neutral: 0,
    disliked: -1
  };
  return preferenceMap[preference] || 0;
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