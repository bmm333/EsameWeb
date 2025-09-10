"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.AuthController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _authService = require("./auth.service.js");
var _localAuthGuard = require("./guards/local-auth.guard.js");
var _jwtAuthGuard = require("./guards/jwt-auth.guard.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _class, _class2;
let AuthController = exports.AuthController = (_dec = (0, _common.Controller)('auth'), _dec2 = (0, _common.Dependencies)(_authService.AuthService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec5 = (0, _common.UseGuards)(_localAuthGuard.LocalAuthGuard), _dec6 = (0, _common.Post)('signin'), _dec7 = (0, _common.Bind)((0, _common.Request)()), _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0]), _dec0 = (0, _common.Post)('signup'), _dec1 = (0, _common.Bind)((0, _common.Body)()), _dec10 = Reflect.metadata("design:type", Function), _dec11 = Reflect.metadata("design:paramtypes", [void 0]), _dec12 = (0, _common.Get)('verify/:token'), _dec13 = (0, _common.Bind)((0, _common.Param)()), _dec14 = Reflect.metadata("design:type", Function), _dec15 = Reflect.metadata("design:paramtypes", [void 0]), _dec16 = (0, _common.Get)('verify'), _dec17 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec18 = (0, _common.Bind)((0, _common.Request)()), _dec19 = Reflect.metadata("design:type", Function), _dec20 = Reflect.metadata("design:paramtypes", [void 0]), _dec21 = (0, _common.Post)('resend-verification'), _dec22 = (0, _common.Bind)((0, _common.Body)()), _dec23 = Reflect.metadata("design:type", Function), _dec24 = Reflect.metadata("design:paramtypes", [void 0]), _dec25 = (0, _common.Post)('forgot-password'), _dec26 = (0, _common.Bind)((0, _common.Body)()), _dec27 = Reflect.metadata("design:type", Function), _dec28 = Reflect.metadata("design:paramtypes", [void 0]), _dec29 = (0, _common.Post)('reset-password'), _dec30 = (0, _common.Bind)((0, _common.Body)()), _dec31 = Reflect.metadata("design:type", Function), _dec32 = Reflect.metadata("design:paramtypes", [void 0]), _dec33 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec34 = (0, _common.Post)('change-password'), _dec35 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Body)()), _dec36 = Reflect.metadata("design:type", Function), _dec37 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec38 = (0, _common.Post)('refresh'), _dec39 = (0, _common.Bind)((0, _common.Body)()), _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [void 0]), _dec42 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec43 = (0, _common.Post)('logout'), _dec44 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Body)()), _dec45 = Reflect.metadata("design:type", Function), _dec46 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec47 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec48 = (0, _common.Get)('profile'), _dec49 = (0, _common.Bind)((0, _common.Request)()), _dec50 = Reflect.metadata("design:type", Function), _dec51 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = class AuthController {
  constructor(authService) {
    this.authService = authService;
  }
  async signin(req) {
    return this.authService.signin(req.user);
  }
  async signup(signupData) {
    return this.authService.signup(signupData);
  }
  async verifyEmail({
    token
  }) {
    return this.authService.verifyEmail(token);
  }
  async verifyToken(req) {
    return this.authService.verifyToken(req.user);
  }
  async resendVerificationEmail({
    email
  }) {
    return this.authService.resendVerificationEmail(email);
  }
  async forgotPassword({
    email
  }) {
    return this.authService.requestPasswordReset(email);
  }
  async resetPassword({
    token,
    newPassword
  }) {
    return this.authService.resetPassword(token, newPassword);
  }
  async changePassword(req, {
    currentPassword,
    newPassword
  }) {
    try {
      const userId = req.user.id;
      console.log('AuthController: change password request for user:', userId);
      return await this.authService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
  async refreshToken({
    refreshToken
  }) {
    if (!refreshToken) {
      throw new _common.BadRequestException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }
  async logout(req, body) {
    const token = this.extractTokenFromRequest(req);
    const refreshToken = body?.refreshToken || null;
    return this.authService.logout(token, refreshToken);
  }
  async getProfile(req) {
    return this.authService.getProfile(req.user);
  }
  extractTokenFromRequest(request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "signin", [_dec5, _dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "signin"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "signup", [_dec0, _dec1, _dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "signup"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "verifyEmail", [_dec12, _dec13, _dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "verifyEmail"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "verifyToken", [_dec16, _dec17, _dec18, _dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "verifyToken"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "resendVerificationEmail", [_dec21, _dec22, _dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "resendVerificationEmail"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "forgotPassword", [_dec25, _dec26, _dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "forgotPassword"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "resetPassword", [_dec29, _dec30, _dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "resetPassword"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "changePassword", [_dec33, _dec34, _dec35, _dec36, _dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "changePassword"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "refreshToken", [_dec38, _dec39, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshToken"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "logout", [_dec42, _dec43, _dec44, _dec45, _dec46], Object.getOwnPropertyDescriptor(_class2.prototype, "logout"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getProfile", [_dec47, _dec48, _dec49, _dec50, _dec51], Object.getOwnPropertyDescriptor(_class2.prototype, "getProfile"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class);