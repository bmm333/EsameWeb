import { Injectable, ExecutionContext, UnauthorizedException, Dependencies } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
@Dependencies(AuthService)
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (this.authService && this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return await super.canActivate(context);
  }

  extractTokenFromHeader(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}