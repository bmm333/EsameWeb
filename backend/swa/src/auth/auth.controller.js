// backend/swa/src/auth/auth.controller.js
import { Bind, Body, Controller, Dependencies, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@Dependencies(AuthService)
@Dependencies(UserService)
export class AuthController {
  constructor(authService, userService) {
    this.authService = authService;
    this.userService = userService;
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
  async register(createUserDto) {
    return this.userService.create(createUserDto);
  }
}