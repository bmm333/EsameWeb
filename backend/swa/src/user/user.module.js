import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { User } from './entities/user.entity.js';
import { UserStylePreference } from './entities/user-style-preferences.entity.js';
import { UserColorPreference } from './entities/user-color-preferences.entity.js';
import { UserFavoriteShop } from './entities/user-shop.entity.js';
import { UserSize } from './entities/user-size.entity.js';
import { UserLifestyle } from './entities/user-lifestyle.entity.js';
import { UserOccasion } from './entities/user-occasion.entity.js';
import { UserAvoidMaterial } from './entities/user-avoid.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserStylePreference,
      UserColorPreference,
      UserFavoriteShop,
      UserSize,
      UserLifestyle,
      UserOccasion,
      UserAvoidMaterial
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}