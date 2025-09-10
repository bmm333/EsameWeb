import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { User } from './entities/user.entity.js';
import { UserStylePreference } from './entities/user-style-preferences.entity.js';
import { UserColorPreference } from './entities/user-color-preferences.entity.js';
import { UserLifestyle } from './entities/user-lifestyle.entity.js';
import { UserOccasion } from './entities/user-occasion.entity.js';
import { MediaModule } from '../media/media.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserStylePreference,
      UserColorPreference,
      UserLifestyle,
      UserOccasion,
    ]),
    MediaModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}