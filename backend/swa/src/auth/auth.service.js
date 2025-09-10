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
@Dependencies(UserService, JwtService, MailingService)
export class AuthService {
  constructor(userService, jwtService, mailingService) {
    this.userService = userService;
    this.jwtService = jwtService;
    this.mailingService = mailingService;
    this.blacklistedTokens = new Set();
    this.blacklistedRefreshTokens = new Set();
    this.initcleanup();
  }

  initcleanup() {
    setInterval(() => {
      if (this.blacklistedTokens.size > 1000) {
        this.blacklistedTokens.clear();
      }
      if (this.blacklistedRefreshTokens.size > 1000) {
        this.blacklistedRefreshTokens.clear();
      }
    }, 3600000);
  }

  async handleerror(operation, error) {
    console.error(`${operation} error:`, error);
    if (error instanceof BadRequestException || 
        error instanceof UnauthorizedException || 
        error instanceof NotFoundException) {
      throw error;
    }
    throw new BadRequestException(`${operation} failed`);
  }

  async hashpassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  async comparepassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  createtoken(payload, expiresin = '15m') {
    return this.jwtService.sign(payload, { expiresIn: expiresin });
  }

  verifytoken(token, secret = null) {
    const options = secret ? { secret } : {};
    return this.jwtService.verify(token, options);
  }

  generatetoken() {
    return crypto.randomBytes(32).toString('hex');
  }

  addexpiry(hours = 1) {
    const expires = new Date();
    expires.setHours(expires.getHours() + hours);
    return expires;
  }

  validatepasswordstrength(password) {
    if (password.length < 8) {
      return { isvalid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isvalid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isvalid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isvalid: false, message: 'Password must contain at least one number' };
    }
    return { isvalid: true };
  }

  async sendemail(type, user, token = null) {
    try {
      switch (type) {
        case 'verification':
          await this.mailingService.sendVerificationEmail(user, token);
          break;
        case 'passwordreset':
          await this.mailingService.sendPasswordResetEmail(user, token);
          break;
        case 'passwordchange':
          await this.mailingService.sendPasswordChangeConfirmation(user);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${type} email:`, error);
    }
  }

  cleanuser(user) {
    const { password, verificationToken, resetPasswordToken, refreshToken, ...cleaneduser } = user;
    return cleaneduser;
  }

  createresponse(statuscode, message, data = {}) {
    return {
      statusCode: statuscode,
      message,
      ...data
    };
  }

  async validateUser(email, password) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return null;
      }

      if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
        throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
      }

      const normalizedpassword = password.trim();
      const ispasswordvalid = await this.comparepassword(normalizedpassword, user.password);

      if (!ispasswordvalid) {
        await this.handlefailedlogin(user);
        return null;
      }

      await this.resetfailedloginattempts(user.id);
      return user;
    } catch (error) {
      await this.handleerror('validateUser', error);
    }
  }

  async handlefailedlogin(user) {
    const maxattempts = 5;
    const locktimeminutes = 30;
    const failedattempts = (user.failedLoginAttempts || 0) + 1;

    const updatedata = { failedLoginAttempts: failedattempts };
    
    if (failedattempts >= maxattempts) {
      const lockuntil = new Date();
      lockuntil.setMinutes(lockuntil.getMinutes() + locktimeminutes);
      updatedata.lockedUntil = lockuntil;
    }

    await this.userService.updateUserRecord(user.id, updatedata);
  }

  async resetfailedloginattempts(userid) {
    await this.userService.updateUserRecord(userid, {
      failedLoginAttempts: 0,
      lockedUntil: null
    });
  }

  async signin(user) {
    try {
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

      const accesstoken = this.createtoken(payload);
      const refreshtoken = this.generaterefreshtoken(user.id);

      // Store the refresh token directly (it's already a JWT)
      await this.userService.updateUserRecord(user.id, { 
        refreshToken: refreshtoken 
      });

      return this.createresponse(200, 'Sign in successful', {
        token: accesstoken,
        accessToken: accesstoken,
        refreshToken: refreshtoken,
        user: this.cleanuser(user),
        needsProfileSetup: !user.profileSetupCompleted
      });
    } catch (error) {
      await this.handleerror('signin', error);
    }
  }

  async signup(signupdata) {
    try {
      const { email, password, firstName, lastName, enableTrial } = signupdata;

      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException('All fields are required');
      }

      const normalizedpassword = password.trim();
      if (!normalizedpassword) {
        throw new BadRequestException('Password cannot be empty');
      }

      const existinguser = await this.userService.findByEmail(email);
      if (existinguser) {
        throw new BadRequestException('Email already exists');
      }

      const passwordvalidation = this.validatepasswordstrength(normalizedpassword);
      if (!passwordvalidation.isvalid) {
        throw new BadRequestException(passwordvalidation.message);
      }

      const verificationtoken = this.generatetoken();
      const now = new Date();
      const expires = this.addexpiry(24);
      const trialexpires = new Date(now);
      trialexpires.setDate(trialexpires.getDate() + 30);

      const hashedpassword = await this.hashpassword(normalizedpassword);

      const userdata = {
        email,
        password: hashedpassword,
        firstName,
        lastName,
        verificationToken: verificationtoken,
        verificationTokenExpires: expires,
        passwordChangedAt: now,
        trial: enableTrial || false,
        trialExpires: enableTrial ? trialexpires : null,
        subscriptionTier: enableTrial ? 'trial' : 'free',
        provider: 'local'
      };

      const saveduser = await this.userService.createUser(userdata);
      await this.sendemail('verification', saveduser, verificationtoken);

      const responsedata = {
        user: this.cleanuser(saveduser)
      };

      if (enableTrial) {
        responsedata.trial = {
          enabled: true,
          expiresAt: trialexpires,
          message: 'Trial account created! You have 30 days to explore our features.'
        };
      }

      return this.createresponse(201, 'User registered successfully. Please check your email for verification.', responsedata);
    } catch (error) {
      await this.handleerror('signup', error);
    }
  }

  generaterefreshtoken(userid) {
    return this.createtoken(
      { sub: userid, type: 'refresh' },
      '7d'
    );
  }

  async refreshToken(refreshtoken) {
    try {
      if (this.isrefreshtokenblacklisted(refreshtoken)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Use the same secret as configured in the module
      const payload = this.verifytoken(refreshtoken);
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findOneById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Compare JWT tokens directly
      if (refreshtoken !== user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newpayload = { 
        sub: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      };

      const newaccesstoken = this.createtoken(newpayload);
      const newrefreshtoken = this.generaterefreshtoken(user.id);

      // Store the new refresh token directly
      await this.userService.updateUserRecord(user.id, { 
        refreshToken: newrefreshtoken 
      });

      this.blacklistedRefreshTokens.add(refreshtoken);

      return this.createresponse(200, null, {
        accessToken: newaccesstoken,
        refreshToken: newrefreshtoken,
        token: newaccesstoken
      });
    } catch (error) {
      await this.handleerror('refreshToken', error);
    }
  }

  async verifyEmail(token) {
    try {
      const user = await this.userService.findByVerificationToken(token);
      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      if (new Date() > new Date(user.verificationTokenExpires)) {
        throw new BadRequestException('Verification token has expired');
      }

      await this.userService.verifyUser(user.id);

      return this.createresponse(200, 'Email verified successfully', {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          isVerified: true
        }
      });
    } catch (error) {
      await this.handleerror('verifyEmail', error);
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

      const verificationtoken = this.generatetoken();
      const verificationexpires = this.addexpiry(24);

      await this.userService.setVerificationToken(user.id, verificationtoken, verificationexpires);
      await this.sendemail('verification', user, verificationtoken);

      return this.createresponse(200, 'Verification email resent successfully');
    } catch (error) {
      await this.handleerror('resendVerificationEmail', error);
    }
  }

  async logout(token, refreshtoken = null) {
    try {
      if (token) {
        this.blacklistedTokens.add(token);
      }

      if (refreshtoken) {
        this.blacklistedRefreshTokens.add(refreshtoken);
        try {
          // Use the same secret as configured in the module
          const payload = this.verifytoken(refreshtoken);
          await this.userService.updateUserRecord(payload.sub, { 
            refreshToken: null 
          });
        } catch (error) {
          console.error('Error clearing refresh token from database:', error);
        }
      }

      return this.createresponse(200, 'Logged out successfully');
    } catch (error) {
      return this.createresponse(200, 'Logged out successfully');
    }
  }

  isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  isrefreshtokenblacklisted(token) {
    return this.blacklistedRefreshTokens.has(token);
  }

  async validateToken(token) {
    try {
      if (this.istokenblacklisted(token)) {
        return null;
      }
      return this.verifytoken(token);
    } catch (error) {
      return null;
    }
  }

  async requestPasswordReset(email) {
    try {
      const user = await this.userService.findByEmail(email);
      const genericmessage = 'If an account with this email exists, you will receive a password reset link';

      if (!user) {
        return this.createresponse(200, genericmessage);
      }

      const resettoken = this.generatetoken();
      const resetexpires = this.addexpiry(1);

      await this.userService.setResetPasswordToken(user.id, resettoken, resetexpires);
      await this.sendemail('passwordreset', user, resettoken);

      return this.createresponse(200, genericmessage);
    } catch (error) {
      await this.handleerror('requestPasswordReset', error);
    }
  }

  validatePasswordStrength(password) {
    return this.validatepasswordstrength(password);
  }

  async resetPassword(token, newpassword) {
    try {
      const user = await this.userService.findByResetToken(token);
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      if (new Date() > new Date(user.resetPasswordExpires)) {
        throw new BadRequestException('Reset token has expired');
      }

      const passwordvalidation = this.validatepasswordstrength(newpassword);
      if (!passwordvalidation.isvalid) {
        throw new BadRequestException(passwordvalidation.message);
      }

      const hashedpassword = await this.hashpassword(newpassword);
      await this.userService.updatePassword(user.id, hashedpassword);
      await this.sendemail('passwordchange', user);

      return this.createresponse(200, 'Password reset successfully');
    } catch (error) {
      await this.handleerror('resetPassword', error);
    }
  }

  async changePassword(userid, currentpassword, newpassword) {
    try {
      const user = await this.userService.findOneByIdWithPassword(userid);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const iscurrentpasswordvalid = await this.comparepassword(currentpassword, user.password);
      if (!iscurrentpasswordvalid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const passwordvalidation = this.validatepasswordstrength(newpassword);
      if (!passwordvalidation.isvalid) {
        throw new BadRequestException(passwordvalidation.message);
      }

      const issamepassword = await this.comparepassword(newpassword, user.password);
      if (issamepassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      const hashedpassword = await this.hashpassword(newpassword);
      await this.userService.updatePassword(userid, hashedpassword);
      await this.sendemail('passwordchange', user);

      return this.createresponse(200, 'Password changed successfully');
    } catch (error) {
      await this.handleerror('changePassword', error);
    }
  }

  async verifyToken(user) {
    return this.createresponse(200, null, {
      valid: true,
      user: {
        id: user.id,
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profileSetupCompleted: user.profileSetupCompleted,
        profilePicture: user.profilePicture
      }
    });
  }

  async getProfile(user) {
    const freshuser = await this.userService.findOneById(user.id || user.userId);
    
    return this.createresponse(200, null, {
      user: {
        id: freshuser.id,
        email: freshuser.email,
        firstName: freshuser.firstName,
        lastName: freshuser.lastName,
        profilePicture: freshuser.profilePicture,
        isVerified: freshuser.isVerified,
        profileSetupCompleted: freshuser.profileSetupCompleted,
        stylePreferences: freshuser.stylePreferences,
        colorPreferences: freshuser.colorPreferences,
        phoneNumber: freshuser.phoneNumber,
        dateOfBirth: freshuser.dateOfBirth,
        gender: freshuser.gender,
        createdAt: freshuser.createdAt,
        updatedAt: freshuser.updatedAt,
        lastLoginAt: freshuser.lastLoginAt
      }
    });
  }
}