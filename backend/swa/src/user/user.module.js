import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { APP_PIPE } from '../../node_modules/@nestjs/core/constants';
import { transform } from '@babel/core';
import { ValidationPipe } from '@nestjs/common';


@Module({
  controllers: [UserController],
  providers: [
    UserService,    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true, 
        whitelist: true,
        forbidNonWhitelisted: true
      })
    }
  ]
})
export class UserModule {}
