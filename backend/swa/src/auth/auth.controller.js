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
    return this.authService.signin(req.user);
  }

  @Post('signup')
  @Bind(Body())
  async signup(signupData) {
    return this.authService.signup(signupData);
  }

  // Email verification route - GET /auth/verify/:token
  @Get('verify/:token')
  @Bind(Param())
  async verifyEmail({ token }) {
    return this.authService.verifyEmail(token);
  }

  // Token verification route - GET /auth/verify (with JWT guard)
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @Bind(Request())
  async verifyToken(req) {
    return this.authService.verifyToken(req.user);
  }

  @Post('resend-verification')
  @Bind(Body())
  async resendVerificationEmail({ email }) {
    return this.authService.resendVerificationEmail(email);
  }

   @Post('forgot-password')
  @Bind(Body())
  async forgotPassword({ email }) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @Bind(Body())
  async resetPassword({ token, newPassword }) {
    return this.authService.resetPassword(token, newPassword);
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
  @Bind(Request())
  async logout(req) {
    const token = this.extractTokenFromRequest(req);
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Bind(Request())
  async getProfile(req) {
    return this.authService.getProfile(req.user);
  }

  extractTokenFromRequest(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}