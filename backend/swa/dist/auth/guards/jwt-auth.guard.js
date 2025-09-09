"use strict";

exports.__esModule = true;
exports.JwtAuthGuard = void 0;
var _common = require("@nestjs/common");
var _passport = require("@nestjs/passport");
var _auth = require("../auth.service");
var _dec, _dec2, _dec3, _dec4, _class;
let JwtAuthGuard = exports.JwtAuthGuard = (_dec = (0, _common.Injectable)(), _dec2 = (0, _common.Dependencies)(_auth.AuthService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class JwtAuthGuard extends (0, _passport.AuthGuard)('jwt') {
  constructor(authService) {
    super();
    this.authService = authService;
  }
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new _common.UnauthorizedException('No token provided');
    }
    if (this.authService && this.authService.isTokenBlacklisted(token)) {
      throw new _common.UnauthorizedException('Token has been revoked');
    }
    return await super.canActivate(context);
  }
  extractTokenFromHeader(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new _common.UnauthorizedException('Invalid token');
    }
    return user;
  }
}) || _class) || _class) || _class) || _class);