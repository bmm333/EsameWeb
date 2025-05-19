import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import JwtStrategy from 'passport-jwt/lib/strategy';
import { PassportModule } from '@nestjs/passport';



@Module({
  imports: [UserModule,PassportModule,JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:"1d"},
  }),],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy,GoogleStrategy],
  exports:[AuthService]
})
export class AuthModule {}
