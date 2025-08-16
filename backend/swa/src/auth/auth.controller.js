import { 
  Bind, 
  Body, 
  Controller, 
  Dependencies, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Get,
  Param,
  UseGuards, 
  Request, 
  Res,
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @Bind(Request())
  async signin(req) {
    try {
      console.log('AuthController: signin request for user:', req.user?.email);
      return await this.authService.signin(req.user);
    } catch (error) {
      console.error('Signin controller error:', error);
      throw error;
    }
  }

  @Post('signup')
  @Bind(Body())
  async signup(signupData) {
    try {
      console.log('AuthController: signup request for:', signupData.email);
      return await this.authService.signup(signupData);
    } catch (error) {
      console.error('Signup controller error:', error);
      throw error;
    }
  }

  // Email verification route - GET /auth/verify/:token
  @Get('verify/:token')
  @Bind(Param())
  async verifyEmail({ token }) {
    try {
      console.log('AuthController: email verification request for token:', token);
      return await this.authService.verifyEmail(token);
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Token verification route - GET /auth/verify (with JWT guard)
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @Bind(Request())
  async verifyToken(req) {
    try {
      const user = req.user;
      return {
        statusCode: 200,
        valid: true,
        user: {
          id: user.sub || user.id,
          userId: user.sub || user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('resend-verification')
  @Bind(Body())
  async resendVerificationEmail({ email }) {
    try {
      console.log('AuthController: resend verification request for:', email);
      return await this.authService.resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  @Post('forgot-password')
  @Bind(Body())
  async forgotPassword({ email }) {
    try {
      console.log('AuthController: forgot password request for:', email);
      return await this.authService.requestPasswordReset(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  @Post('reset-password')
  @Bind(Body())
  async resetPassword({ token, newPassword }) {
    try {
      console.log('AuthController: reset password request for token:', token);
      return await this.authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @Bind(Request(), Body())
  async changePassword(req, { currentPassword, newPassword }) {
    try {
      const userId = req.user.sub || req.user.id;
      console.log('AuthController: change password request for user:', userId);
      return await this.authService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Bind(Request(), Res())
  async logout(req, res) {
    try {
      const token = this.extractTokenFromRequest(req);
      const result = await this.authService.logout(token);

      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Logout controller error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Bind(Request())
  async getProfile(req) {
    try {
      return req.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  extractTokenFromRequest(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}