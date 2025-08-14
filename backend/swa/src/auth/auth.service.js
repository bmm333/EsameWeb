import { Dependencies, Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
@Dependencies(UserService, JwtService)
export class AuthService {
  constructor(userService, jwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
    this.blacklistedTokens = new Set();
  }

  async validateUser(email, password) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async login(user) {
    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      iat: Math.floor(Date.now() / 1000)
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  async signup(signupData) {
    try {
      console.log('AuthService: Processing signup for:', signupData.email);

      // Authentication domain validations
      const missingFields = [];
      if (!signupData.firstName) missingFields.push('firstName');
      if (!signupData.email) missingFields.push('email');
      if (!signupData.password) missingFields.push('password');

      if (missingFields.length > 0) {
        throw new BadRequestException({
          message: 'Validation failed - missing required fields',
          missingFields
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Password strength validation
      if (signupData.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      // Check if user already exists (business rule)
      const existingUser = await this.userService.findByEmail(signupData.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password (authentication concern)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(signupData.password, salt);

      // Create user data with authentication-specific defaults
      const userData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName || '',
        email: signupData.email.toLowerCase(),
        password: hashedPassword,
        isVerified: false, // Authentication business rule
        provider: 'local' // Authentication metadata
      };

      // Use UserService for pure entity creation
      const savedUser = await this.userService.createUser(userData);

      // Remove sensitive data from response
      const { password, ...userResponse } = savedUser;

      // TODO: Send verification email (authentication concern)
      // await this.emailService.sendVerificationEmail(userResponse);

      return {
        statusCode: 201,
        message: 'User registered successfully. Please check your email for verification.',
        user: userResponse
      };

    } catch (error) {
      console.error('AuthService signup error:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async logout(token) {
    this.blacklistedTokens.add(token);
    return { message: 'Logged out successfully' };
  }

  isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  async validateToken(token) {
    try {
      if (this.isTokenBlacklisted(token)) {
        return null;
      }
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Additional authentication methods can go here:
  // - requestPasswordReset()
  // - resetPassword()
  // - verifyEmail()
  // - resendVerification()
  // - refreshToken()
}