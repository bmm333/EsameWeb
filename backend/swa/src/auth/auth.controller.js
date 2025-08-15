import { Bind, Body, Controller, Dependencies, HttpCode, HttpStatus, Post, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Bind(Request(), Body())
  async login(req, loginDto) {
    const dto = new LoginDto(loginDto);
    return this.authService.login(req.user);
  }

  @Post('register')
  @Bind(Body())
  async register(signupData) {
    return this.authService.signup(signupData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Bind(Request(), Res())
  async logout(req, res) {
    const token = this.extractTokenFromRequest(req);
    const result = await this.authService.logout(token);

    // Set no-cache headers bcs of security reasons
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Bind(Request())
  async getProfile(req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @Bind(Request(), Res())
  async verifyToken(req, res) {
    // Set no-cache headers for auth verification
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json({ valid: true, user: req.user });
  }
  
  @Post('verify-email')
  @Bind(Body())
  async verifyEmail({ token }) {
    return this.authService.verifyEmail(token);
  }
  
  @Post('resend-verification')
  @Bind(Body())
  async resendVerification({ email }) {
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
    return this.authService.changePassword(req.user.sub, currentPassword, newPassword);
  }

  extractTokenFromRequest(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}