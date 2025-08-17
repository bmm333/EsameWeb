import { Injectable,Dependencies,UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt,Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service.js';


@Injectable()
@Dependencies(UserService)
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(userService) {
    super({
      jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:false,
      secretOrKey:process.env.JWT_SECRET||'feb47943bb2f57edd2371543f849c6354ddb70a9f3bb6e057758c74c2927686b' //fallback for dev simplicity
    });
    this.userService=userService;
  }
  async validate(payload) {
    console.log('JwtStrategy: Validating JWT Payload:',payload);
    try{
      const user=await this.userService.findOneById(payload.sub);
      if(!user){
        throw new Error('JWTSTRATEGY: User not found for id :',payload.sub);
      }
      const { password, verificationToken, resetPasswordToken, ...userWithoutSensitiveData } = user;
      const validatedUser = {
        id: user.id,
        userId: user.id, //bckw compatibility
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profileSetupCompleted: user.profileSetupCompleted,
        ...userWithoutSensitiveData
      };
      console.log('JwtStrategy: Validation successful for user:', validatedUser.email);
      return validatedUser;
    }catch(error)
    {
      console.error('JwtStrategy validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
