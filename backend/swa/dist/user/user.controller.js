"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.UserController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _platformExpress = require("@nestjs/platform-express");
var _user = require("./user.service");
var _jwtAuth = require("../auth/guards/jwt-auth.guard");
var _createUserDto = require("./dto/create-user.dto.js");
var _updateUserDto = require("./dto/update-user.dto.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _class, _class2;
let UserController = exports.UserController = (_dec = (0, _common.Controller)('user'), _dec2 = (0, _common.Dependencies)(_user.UserService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec5 = (0, _common.Get)(), _dec6 = Reflect.metadata("design:type", Function), _dec7 = Reflect.metadata("design:paramtypes", []), _dec8 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec9 = (0, _common.Get)('profile'), _dec0 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec1 = Reflect.metadata("design:type", Function), _dec10 = Reflect.metadata("design:paramtypes", [void 0]), _dec11 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec12 = (0, _common.Get)('profile/setup-status'), _dec13 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec14 = Reflect.metadata("design:type", Function), _dec15 = Reflect.metadata("design:paramtypes", [void 0]), _dec16 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec17 = (0, _common.Put)('profile'), _dec18 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec19 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec20 = Reflect.metadata("design:type", Function), _dec21 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec22 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec23 = (0, _common.Post)('profile/setup'), _dec24 = (0, _common.UseInterceptors)((0, _platformExpress.FileInterceptor)('profilePicture')), _dec25 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec26 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec27 = function (target, key) {
  return (0, _common.UploadedFile)()(target, key, 2);
}, _dec28 = Reflect.metadata("design:type", Function), _dec29 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec30 = (0, _common.Get)(':id'), _dec31 = function (target, key) {
  return (0, _common.Param)('id', _common.ParseIntPipe)(target, key, 0);
}, _dec32 = Reflect.metadata("design:type", Function), _dec33 = Reflect.metadata("design:paramtypes", [void 0]), _dec34 = (0, _common.Post)(), _dec35 = function (target, key) {
  return (0, _common.Body)()(target, key, 0);
}, _dec36 = Reflect.metadata("design:type", Function), _dec37 = Reflect.metadata("design:paramtypes", [void 0]), _dec38 = (0, _common.Put)(':id'), _dec39 = function (target, key) {
  return (0, _common.Param)('id', _common.ParseIntPipe)(target, key, 0);
}, _dec40 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec41 = Reflect.metadata("design:type", Function), _dec42 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec43 = (0, _common.Delete)(':id'), _dec44 = function (target, key) {
  return (0, _common.Param)('id', _common.ParseIntPipe)(target, key, 0);
}, _dec45 = Reflect.metadata("design:type", Function), _dec46 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  async findAll() {
    return this.userService.findAll();
  }
  async getProfile(req) {
    const userId = req.user.id;
    if (!userId) throw new _common.BadRequestException('Invalid user ID');
    const result = await this.userService.findOneById(userId);
    return {
      user: result
    };
  }
  async getProfileSetupStatus(req) {
    try {
      const userId = req.user.id;
      const status = await this.userService.checkProfileSetupStatus(userId);
      return {
        profileSetupCompleted: status.profileSetupCompleted,
        profileSetupCompletedAt: status.profileSetupCompletedAt,
        needsProfileSetup: !status.profileSetupCompleted
      };
    } catch (error) {
      console.error('Profile setup status error:', error);
      throw error;
    }
  }
  async updateOwnProfile(req, updateUserDto /**: UpdateUserDto */) {
    try {
      const userId = req.user.id;
      if (!userId) throw new _common.BadRequestException('Invalid authenticated user');
      return await this.userService.updateUserRecord(userId, updateUserDto);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  async setupProfile(req, body, profilePictureFile) {
    try {
      const userId = req.user.id;
      const profileData = {
        ...body
      };
      ['stylePreferences', 'colorPreferences', 'favoriteShops', 'sizes', 'lifestyles', 'occasions', 'avoidMaterials'].forEach(key => {
        if (profileData[key] && typeof profileData[key] === 'string') {
          try {
            profileData[key] = JSON.parse(profileData[key]);
          } catch (_) {}
        }
      });
      const result = await this.userService.setupUserProfile(userId, profileData, profilePictureFile);
      return {
        statusCode: 200,
        message: 'Profile setup completed successfully',
        user: result
      };
    } catch (error) {
      console.error('Profile setup controller error:', error);
      throw new _common.BadRequestException(`Error setting up user profile: ${error.message}`);
    }
  }
  async findOne(id) {
    try {
      return await this.userService.findOneById(id);
    } catch (error) {
      if (error instanceof _common.NotFoundException) throw error;
      throw new _common.BadRequestException('Invalid user ID');
    }
  }
  async create(createUserDto /**: CreateUserDto */) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  async update(id, updateUserDto /**: UpdateUserDto */) {
    try {
      return await this.userService.updateUserRecord(id, updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  async remove(id) {
    try {
      return await this.userService.remove(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "findAll", [_dec5, _dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "findAll"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getProfile", [_dec8, _dec9, _dec0, _dec1, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getProfile"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getProfileSetupStatus", [_dec11, _dec12, _dec13, _dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "getProfileSetupStatus"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updateOwnProfile", [_dec16, _dec17, _dec18, _dec19, _dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "updateOwnProfile"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "setupProfile", [_dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "setupProfile"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "findOne", [_dec30, _dec31, _dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "findOne"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "create", [_dec34, _dec35, _dec36, _dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "create"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "update", [_dec38, _dec39, _dec40, _dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "update"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "remove", [_dec43, _dec44, _dec45, _dec46], Object.getOwnPropertyDescriptor(_class2.prototype, "remove"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class);