"use strict";

exports.__esModule = true;
exports.JwtStrategy = void 0;
var _common = require("@nestjs/common");
var _passport = require("@nestjs/passport");
var _passportJwt = require("passport-jwt");
var _userService = require("../../user/user.service.js");
var _dec, _dec2, _dec3, _dec4, _class;
let JwtStrategy = exports.JwtStrategy = (_dec = (0, _common.Injectable)(), _dec2 = (0, _common.Dependencies)(_userService.UserService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class JwtStrategy extends (0, _passport.PassportStrategy)(_passportJwt.Strategy) {
  constructor(userService) {
    super({
      jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
    this.userService = userService;
  }
  async validate(payload) {
    console.log('JwtStrategy: Validating JWT Payload:', payload);
    try {
      const user = await this.userService.findOneById(payload.sub);
      if (!user) {
        throw new Error(`JWTSTRATEGY: User not found for id : ${payload.sub}`);
      }
      const {
        password,
        verificationToken,
        resetPasswordToken,
        ...userWithoutSensitiveData
      } = user;
      const validatedUser = {
        id: user.id,
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        profileSetupCompleted: user.profileSetupCompleted,
        ...userWithoutSensitiveData
      };
      console.log('JwtStrategy: Validation successful for user:', validatedUser.email);
      return validatedUser;
    } catch (error) {
      console.error('JwtStrategy validation error:', error);
      throw new _common.UnauthorizedException('Token validation failed');
    }
  }
}) || _class) || _class) || _class) || _class);