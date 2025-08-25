import { 
  Dependencies, 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  NotFoundException 
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { MailingService } from '../mailing/mailing.service';


@Injectable()
@Dependencies(UserService, JwtService,MailingService)
export class AuthService {
  constructor(userService, jwtService,mailingService) {
    this.userService = userService;
    this.jwtService = jwtService;
    this.mailingService = mailingService;
    this.blacklistedTokens = new Set();
  }

  async validateUser(email, password) {
    console.log('validateUser called with:', { email, passwordLength: password?.length });
    
    const user = await this.userService.findByEmail(email);
    console.log('User found:', { 
      id: user?.id, 
      email: user?.email, 
      hasPassword: !!user?.password,
      passwordHash: user?.password?.substring(0, 20) + '...',
      isVerified: user?.isVerified 
    });
    
    if (!user) {
      console.log('No user found');
      return null;
    }
    
    if(user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      console.log('Account locked until:', user.lockedUntil);
      throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
    }
    
    const normalizedPassword = password.trim();
    console.log('Comparing normalized password...');
    
    const isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password invalid, handling failed login');
      await this.handleFailedLogin(user);
      return null;
    }
    
    console.log('Password valid, resetting failed attempts');
    await this.resetFailedLoginAttempts(user.id);
    return user;
  }
  async handleFailedLogin(user)
  {
    const maxAttempts=5;
    const lockTimeMinutes=30;
    const failedAttempts=(user.failedLoginAttempts||0)+1;
    if(failedAttempts>=maxAttempts)
    {
      const lockUntil=new Date();
      lockUntil.setMinutes(lockUntil.getMinutes()+lockTimeMinutes);
      await this.userService.updateUserRecord(user.id,{
        failedLoginAttempts:failedAttempts,
        lockedUntil:lockUntil
      });
    }else{
      await this.userService.updateUserRecord(user.id,{
        failedLoginAttempts:failedAttempts
      });
    }
  }
  async resetFailedLoginAttempts(userId)
  {
    await this.userService.updateUserRecord(userId,{
      failedLoginAttempts:0,
      lockedUntil:null
    });
  }
  async signin(user) {
    try {
      console.log('AuthService: Processing signin for validated user:', user.email);
      
      if (!user.isVerified) {
        throw new UnauthorizedException('Please verify your email before signing in');
      }

      await this.userService.updateLastLogin(user.id);

      const payload = { 
        sub: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      };
      const token = this.jwtService.sign(payload);
      const { verificationToken, resetPasswordToken, ...userResponse } = user;
      
      return {
        statusCode: 200,
        message: 'Sign in successful',
        token,
        user: userResponse,
        needsProfileSetup: !user.profileSetupCompleted
      };

    } catch (error) {
      console.error('AuthService signin error:', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException('Sign in failed. Please try again.');
    }
  }
  async login(user) {
    await this.userService.updateLastLogin(user.id);

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
        lastName: user.lastName,
        isVerified:user.isVerified
      }
    };
  }

  async signup(signupData) {
    const { email, password, firstName, lastName } = signupData;
    const normalizedPassword = password.trim();
    console.log('Signup - Normalized password length:', normalizedPassword.length);
    
    try {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
      const passwordValidation = this.validatePasswordStrength(normalizedPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.message);
      }
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 1); 
      const trialExpires = new Date(now);
      trialExpires.setDate(trialExpires.getDate() + 30);
      const userData = {
        email,
        password: normalizedPassword,
        firstName,
        lastName,
        verificationToken,
        verificationTokenExpires: expires,
        passwordChangedAt: now,
        trial: true,
        trialExpires,
        provider: 'local'
      };
      const savedUser = await this.userService.createUser(userData);
      try {
        await this.mailingService.sendVerificationEmail(savedUser, verificationToken);
        console.log('Verification mail sent successfully');
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
      
      const { password: _, ...userResponse } = savedUser;
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
  async verifyEmail(token)
  {
    try{
      const user=await this.userService.findByVerificationToken(token);
      if(!user)
      {
        throw new BadRequestException('Invalid verification token');
      }
      if(new Date()>new Date(user.verificationTokenExpires)){
        throw new BadRequestException('Verification token has expired');
      }
      await this.userService.verifyUser(user.id);
      return {
        message:'Email verified successfully',
        user:{
          id:user.id,
          email:user.email,
          firstName:user.firstName,
          isVerified:true
        }
      };
    }catch(error)
    {
      if(error instanceof BadRequestException)
      {
        throw error;
      }
      throw new BadRequestException('Email verification failed');
    }
  }
  async resendVerificationEmail(email) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.isVerified) {
        throw new BadRequestException('Email is already verified');
      }
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);
      await this.userService.setVerificationToken(user.id, verificationToken, verificationExpires);
      await this.mailingService.sendVerificationEmail(user, verificationToken);
      return { message: 'Verification email resent successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to resend verification email');
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
  async requestPasswordReset(email) {
    try {
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        return { message: 'If an account with this email exists, you will receive a password reset link' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiration

      await this.userService.setResetPasswordToken(user.id, resetToken, resetExpires);
      await this.mailingService.sendPasswordResetEmail(user, resetToken);

      return { message: 'If an account with this email exists, you will receive a password reset link' };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new BadRequestException('Failed to process password reset request');
    }
  }
  validatePasswordStrength(password) {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
}
  async resetPassword(token, newPassword) {
    try {
      const user = await this.userService.findByResetToken(token);
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      if (new Date() > new Date(user.resetPasswordExpires)) {
        throw new BadRequestException('Reset token has expired');
      }
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.message);
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await this.userService.updatePassword(user.id, hashedPassword);
      try {
        await this.mailingService.sendPasswordChangeConfirmation(user);
      } catch (emailError) {
        console.error('Failed to send password change confirmation:', emailError);
      }

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Password reset failed');
    }
  }
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.userService.findOneById(userId);
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.message);
      }
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await this.userService.update(userId, {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      });
      try {
        await this.mailingService.sendPasswordChangeConfirmation(user);
      } catch (emailError) {
        console.error('Failed to send password change confirmation:', emailError);
      }

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Password change failed');
    }
  }
  async verifyToken(user) {
    console.log('AuthService verifyToken: User from JWT:', user);
    
    return {
      statusCode: 200,
      valid: true,
      user: {
        id: user.id || user.userId,
        userId: user.id || user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profileSetupCompleted: user.profileSetupCompleted,
        profilePicture: user.profilePicture
      }
    };
  }
  async getProfile(user) {
    console.log('AuthService getProfile: Getting profile for user:', user.email);
    // Get fresh user data from database to ensure we have the latest info
    const freshUser = await this.userService.findOneById(user.id || user.userId);
    
    return {
      statusCode: 200,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        profilePicture: freshUser.profilePicture,
        isVerified: freshUser.isVerified,
        profileSetupCompleted: freshUser.profileSetupCompleted,
        stylePreferences: freshUser.stylePreferences,
        colorPreferences: freshUser.colorPreferences,
        phoneNumber: freshUser.phoneNumber,
        dateOfBirth: freshUser.dateOfBirth,
        gender: freshUser.gender,
        createdAt: freshUser.createdAt,
        updatedAt: freshUser.updatedAt,
        lastLoginAt: freshUser.lastLoginAt
      }
    };
  }

  // Additional authentication methods can go here:
  // - requestPasswordReset()
  // - resetPassword()
  // - verifyEmail()
  // - resendVerification()
  // - refreshToken()
}