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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';

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
}