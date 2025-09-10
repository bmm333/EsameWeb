"use strict";

exports.__esModule = true;
exports.LocalStrategy = void 0;
var _passportLocal = require("passport-local");
var _passport = require("@nestjs/passport");
var _common = require("@nestjs/common");
var _auth = require("../auth.service");
var _dec, _dec2, _dec3, _dec4, _class;
let LocalStrategy = exports.LocalStrategy = (_dec = (0, _common.Injectable)(), _dec2 = (0, _common.Dependencies)(_auth.AuthService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class LocalStrategy extends (0, _passport.PassportStrategy)(_passportLocal.Strategy) {
  constructor(authService) {
    super({
      usernameField: 'email'
    });
    this.authService = authService;
  }
  async validate(email, password) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new _common.UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}) || _class) || _class) || _class) || _class);