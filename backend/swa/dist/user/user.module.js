"use strict";

exports.__esModule = true;
exports.UserModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _userController = require("./user.controller.js");
var _userService = require("./user.service.js");
var _userEntity = require("./entities/user.entity.js");
var _userStylePreferencesEntity = require("./entities/user-style-preferences.entity.js");
var _userColorPreferencesEntity = require("./entities/user-color-preferences.entity.js");
var _userLifestyleEntity = require("./entities/user-lifestyle.entity.js");
var _userOccasionEntity = require("./entities/user-occasion.entity.js");
var _mediaModule = require("../media/media.module.js");
var _dec, _class;
let UserModule = exports.UserModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_userEntity.User, _userStylePreferencesEntity.UserStylePreference, _userColorPreferencesEntity.UserColorPreference, _userLifestyleEntity.UserLifestyle, _userOccasionEntity.UserOccasion]), _mediaModule.MediaModule],
  controllers: [_userController.UserController],
  providers: [_userService.UserService],
  exports: [_userService.UserService]
}), _dec(_class = class UserModule {}) || _class);