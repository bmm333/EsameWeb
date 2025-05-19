import { Injectable, BadRequestException, NotFoundException,Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor() {
    this.userRepository = userRepository;
  }

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'isVerified', 'createdAt', 'updatedAt']
    });
  }
  async findOneById(id) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'firstName', 'lastName', 'email', 'isVerified', 'createdAt', 'updatedAt']
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
      throw error;
    }
  }
  async findByEmail(email) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }
  async create(userData) {
    console.log('Creating user with data:', userData);
    if (!userData) {
      throw new BadRequestException('User data is required');
    }
    try {
      // Validating
      const missingFields = [];
      if (!userData.firstName) missingFields.push('firstName');
      if (!userData.lastName) missingFields.push('lastName');
      if (!userData.email) missingFields.push('email');
      if (!userData.password) missingFields.push('password');
      if (missingFields.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed - missing required fields',
          missingFields
        });
      }
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new BadRequestException({
          message: 'User with this email already exists'
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const newUser = this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const savedUser = await this.userRepository.save(newUser);
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }
  async update(id, userData) {
    try {
      const user = await this.findOneById(id);
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      await this.userRepository.update(id, userData);
      return this.findOneById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }
  async remove(id) {
    try {
      const user = await this.findOneById(id);
      await this.userRepository.remove(user);
      return { id, deleted: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error removing user ${id}:`, error);
      throw error;
    }
  }
}

Inject(getRepositoryToken(User))(UserService, undefined, 0);
