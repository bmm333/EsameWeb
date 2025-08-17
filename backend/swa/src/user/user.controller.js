import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  Dependencies,
  Bind,
  UseGuards,
  Request
} from '@nestjs/common';
import { UserService } from './user.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('user')
@Dependencies(UserService)
export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    try {
      return await this.userService.findOneById(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID');
    }
  }

  @Post()
  @Bind(Body())
  async create(createUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  async update(id, updateUserDto) {
    try {
      return await this.userService.update(parseInt(id, 10), updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  @Delete(':id')
  @Bind(Param('id'))
  async remove(id) {
    try {
      return await this.userService.remove(parseInt(id, 10));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  //Against DDD but im going with this for now should refactor later or maybe now 
  @UseGuards(JwtAuthGuard)
  @Post('profile/setup')
  @Bind(Request(), Body())
  async setupProfile(req, profileData) {
    try {
      const userId = req.user.id || req.user.userId || req.user.sub;
      console.log('UserController: Setting up profile for user:', userId);
      console.log('UserController: Profile data:', profileData);

      const result = await this.userService.setupUserProfile(userId, profileData);

      return {
        statusCode: 200,
        message: 'Profile setup completed successfully',
        user: result
      };
    } catch (error) {
      console.error('Profile setup controller error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/setup-status')
  @Bind(Request())
  async getProfileSetupStatus(req) {
    try {
      const userId = req.user.id || req.user.userId || req.user.sub;
      console.log('UserController: Getting profile setup status for user:', userId);

      const status = await this.userService.checkProfileSetupStatus(userId);

      return {
        profileSetupCompleted: status.profileSetupCompleted,
        profileSetupCompletedAt: status.profileSetupCompletedAt,
        needsProfileSetup: !status.profileSetupCompleted
      };
    } catch (error) {
      console.error('Profile setup status error:', error);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @Bind(Request())
  async getProfile(req) {
    try {
      const userId = req.user.id;
      return await this.userService.findOneById(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}