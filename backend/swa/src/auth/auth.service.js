import { Dependencies, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
@Dependencies(UserService, JwtService)
export class AuthService {
  constructor(
    userService,
    jwtService,
  ) {}

  async validateUser(email,password)
  {
    const user=await this.userService.findByEmail(email);
    if(!user)
    {
      return null;
    }
    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid)
    {
      return null;
    }
    return user;
  }
  async login(user)
  {
    const payload={
      email:user.email,
      sub:user.id,
      firstName:user.firstName,
      lastName:user.lastName
    };
    return {
      access_token:this.jwtService.sing(payload),
    }
  }


}
