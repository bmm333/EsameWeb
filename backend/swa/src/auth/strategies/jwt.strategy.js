import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt,Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor() {
    super({
      jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:false,
      secretOrKey:process.env.JWT_SECRET||'feb47943bb2f57edd2371543f849c6354ddb70a9f3bb6e057758c74c2927686b' //fallback for dev simplicity
    });
  }
  async validate(payload) {
    return { userId: payload.sub, email: payload.email };
  }
}
