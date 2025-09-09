"use strict";

exports.__esModule = true;
exports.AuthModule = void 0;
var _common = require("@nestjs/common");
var _auth = require("./auth.controller");
var _auth2 = require("./auth.service");
var _user = require("../user/user.module");
var _mailing = require("../mailing/mailing.module");
var _jwt = require("@nestjs/jwt");
var _passport = require("@nestjs/passport");
var _jwt2 = require("./strategies/jwt.strategy");
var _local = require("./strategies/local.strategy");
var _dec, _class;
let AuthModule = exports.AuthModule = (_dec = (0, _common.Module)({
  imports: [_user.UserModule, _mailing.MailingModule, _passport.PassportModule, _jwt.JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  })],
  controllers: [_auth.AuthController],
  providers: [_auth2.AuthService, _jwt2.JwtStrategy, _local.LocalStrategy],
  exports: [_auth2.AuthService]
}), _dec(_class = class AuthModule {}) || _class);