import { Bind, Body, Controller, Dependencies, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
@Dependencies(AuthService)
@Dependencies(UserService)
export class AuthController {
  constructor(authService,userService) {
    this.authService = authService;
    this.userService = userService;
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Bind(Request())
  async login(req) {
    return this.authService.login(req.user);
  }
  @Post('register')
  @Bind(Body())
  async register(createUserDto) {
    return this.userService.create(createUserDto);
  }
}
