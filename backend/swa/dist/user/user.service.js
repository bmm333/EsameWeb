"use strict";

exports.__esModule = true;
exports.UserService = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _classValidator = require("class-validator");
var _classTransformer = require("class-transformer");
var _userEntity = require("./entities/user.entity.js");
var _createUserDto = require("./dto/create-user.dto.js");
var _userProfileSetupDto = require("./dto/user-profile-setup.dto.js");
var _userStylePreferencesEntity = require("./entities/user-style-preferences.entity.js");
var _userColorPreferencesEntity = require("./entities/user-color-preferences.entity.js");
var _userLifestyleEntity = require("./entities/user-lifestyle.entity.js");
var _userOccasionEntity = require("./entities/user-occasion.entity.js");
var _mediaService = require("../media/media.service.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class;
let UserService = exports.UserService = (_dec = (0, _common.Injectable)(), _dec2 = function (target, key) {
  return (0, _common.Inject)((0, _typeorm.getRepositoryToken)(_userEntity.User))(target, undefined, 0);
}, _dec3 = function (target, key) {
  return (0, _common.Inject)((0, _typeorm.getRepositoryToken)(_userStylePreferencesEntity.UserStylePreference))(target, undefined, 1);
}, _dec4 = function (target, key) {
  return (0, _common.Inject)((0, _typeorm.getRepositoryToken)(_userColorPreferencesEntity.UserColorPreference))(target, undefined, 2);
}, _dec5 = function (target, key) {
  return (0, _common.Inject)((0, _typeorm.getRepositoryToken)(_userLifestyleEntity.UserLifestyle))(target, undefined, 3);
}, _dec6 = function (target, key) {
  return (0, _common.Inject)((0, _typeorm.getRepositoryToken)(_userOccasionEntity.UserOccasion))(target, undefined, 4);
}, _dec7 = function (target, key) {
  return (0, _common.Inject)(_mediaService.MediaService)(target, undefined, 5);
}, _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0, void 0, void 0, void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = _dec6(_class = _dec7(_class = _dec8(_class = _dec9(_class = class UserService {
  constructor(userRepository, stylePreferenceRepository, colorPreferenceRepository, userLifestyleRepository, userOccasionRepository, mediaService) {
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
        where: {
          id: parseInt(id)
        }
      });
      console.log('UserService: User found with password:', {
        id: user?.id,
        email: user?.email,
        hasPassword: !!user?.password
      });
      if (!user) {
        throw new _common.NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof _common.NotFoundException) {
        throw error;
      }
      console.error(`Error finding user by id ${id}:`, error);
      throw new _common.BadRequestException('Error retrieving user');
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
      throw new _common.BadRequestException('Error updating password');
    }
  }
  async findOneById(id) {
    try {
      console.log(`Finding user by id ${id}`);
      const user = await this.userRepository.findOneBy({
        id
      });
      if (!user) {
        console.log(`User with id ${id} not found`);
        return null;
      }
      console.log(`User found: ${user.email}`);
      return user;
    } catch (error) {
      console.error(`Error finding user by id ${id}:`, error);
      throw new _common.BadRequestException('Error retrieving user');
    }
  }
  async findByEmail(email) {
    try {
      return await this.userRepository.findOne({
        where: {
          email
        },
        select: ['id', 'firstName', 'lastName', 'email', 'password', 'isVerified', 'profileSetupCompleted', 'subscriptionTier', 'trial', 'trialExpires', 'failedLoginAttempts', 'lockedUntil']
      });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new _common.BadRequestException('Error finding user');
    }
  }
  async createUser(userData) {
    try {
      const dto = (0, _classTransformer.plainToClass)(_createUserDto.CreateUserDto, userData);
      const validationErrors = await (0, _classValidator.validate)(dto);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(error => Object.values(error.constraints)).flat();
        throw new _common.BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new _common.BadRequestException('User with this email already exists');
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
      const {
        password,
        ...userResponse
      } = savedUser;
      return userResponse;
    } catch (error) {
      if (error instanceof _common.BadRequestException) {
        throw error;
      }
      console.error('Error creating user entity:', error);
      throw new _common.BadRequestException('Error creating user entity');
    }
  }
  async updateUserRecord(userId, updateData) {
    try {
      const {
        stylePreferences,
        colorPreferences,
        lifestyles,
        occasions,
        defaultWeatherLocation,
        ...scalarData
      } = updateData;
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
      throw new _common.BadRequestException('Error updating user record');
    }
  }
  async setupUserProfile(userId, profileData, profilePictureFile = null) {
    try {
      const user = await this.findOneById(userId);
      if (user.profileSetupCompleted) {
        throw new _common.BadRequestException('Profile setup already completed');
      }
      const dto = (0, _classTransformer.plainToClass)(_userProfileSetupDto.UserProfileSetupDto, profileData);
      const validationErrors = await (0, _classValidator.validate)(dto);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(error => Object.values(error.constraints || {})).flat();
        throw new _common.BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      let profilePictureUrl = dto.profilePicture || null;
      if (profilePictureFile) {
        const uploadResult = await this.mediaService.uploadImage(userId, profilePictureFile, {
          folder: 'profiles',
          removeBackground: false
        });
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
      if (error instanceof _common.BadRequestException || error instanceof _common.NotFoundException) {
        throw error;
      }
      throw new _common.BadRequestException(`Error setting up user profile: ${error.message}`);
    }
  }
  async handleUserRelations(userId, dto) {
    try {
      if (dto.stylePreferences && Array.isArray(dto.stylePreferences)) {
        await this.stylePreferenceRepository.delete({
          userId
        });
        if (dto.stylePreferences.length > 0) {
          const stylePrefs = dto.stylePreferences.map(style => this.stylePreferenceRepository.create({
            userId,
            style: typeof style === 'string' ? style : style.style || style.styleName,
            priority: 1
          }));
          await this.stylePreferenceRepository.save(stylePrefs);
        }
      }
      if (dto.colorPreferences && Array.isArray(dto.colorPreferences)) {
        await this.colorPreferenceRepository.delete({
          userId
        });
        if (dto.colorPreferences.length > 0) {
          const colorPrefs = dto.colorPreferences.map(color => this.colorPreferenceRepository.create({
            userId,
            color: typeof color === 'string' ? color : color.color || color.colorName,
            hexCode: typeof color === 'object' ? color.hexCode : null,
            preference: this.mapPreferenceToInteger(color.preference)
          }));
          await this.colorPreferenceRepository.save(colorPrefs);
        }
      }
      if (dto.lifestyles && Array.isArray(dto.lifestyles)) {
        await this.userLifestyleRepository.delete({
          userId
        });
        if (dto.lifestyles.length > 0) {
          const lifestylePrefs = dto.lifestyles.map(lifestyle => this.userLifestyleRepository.create({
            userId,
            lifestyle: typeof lifestyle === 'string' ? lifestyle : lifestyle.lifestyle || lifestyle.lifestyleName,
            percentage: typeof lifestyle === 'object' ? lifestyle.percentage : 100
          }));
          await this.userLifestyleRepository.save(lifestylePrefs);
        }
      }
      if (dto.occasions && Array.isArray(dto.occasions)) {
        await this.userOccasionRepository.delete({
          userId
        });
        if (dto.occasions.length > 0) {
          const occasionPrefs = dto.occasions.map(occasion => this.userOccasionRepository.create({
            userId,
            occasion: typeof occasion === 'string' ? occasion : occasion.occasion || occasion.occasionName,
            frequency: typeof occasion === 'object' ? occasion.frequency : 'monthly'
          }));
          await this.userOccasionRepository.save(occasionPrefs);
        }
      }
    } catch (error) {
      throw new _common.BadRequestException(`Error saving user preferences: ${error.message}`);
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
      throw new _common.BadRequestException('Error verifying user');
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
      throw new _common.BadRequestException('Error setting verification token');
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
      throw new _common.BadRequestException('Error setting reset password token');
    }
  }
  async findByVerificationToken(token) {
    try {
      return await this.userRepository.findOne({
        where: {
          verificationToken: token
        },
        select: ['id', 'email', 'isVerified', 'verificationTokenExpires']
      });
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw new _common.BadRequestException('Error finding user');
    }
  }
  async findByResetToken(token) {
    try {
      return await this.userRepository.findOne({
        where: {
          resetPasswordToken: token
        },
        select: ['id', 'email', 'resetPasswordExpires']
      });
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw new _common.BadRequestException('Error finding user');
    }
  }
  async checkProfileSetupStatus(userId) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        },
        select: ['id', 'profileSetupCompleted', 'profileSetupCompletedAt']
      });
      if (!user) {
        throw new _common.NotFoundException('User not found');
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
      return {
        success: true
      };
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new _common.BadRequestException('Error deleting user');
    }
  }
}) || _class) || _class) || _class) || _class) || _class) || _class) || _class) || _class) || _class);