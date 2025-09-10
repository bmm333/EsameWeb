"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.SettingsController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _settingsService = require("./settings.service.js");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2;
let SettingsController = exports.SettingsController = (_dec = (0, _common.Controller)('settings'), _dec2 = (0, _common.Dependencies)(_settingsService.SettingService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec5 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec6 = (0, _common.Get)(), _dec7 = (0, _common.Bind)((0, _common.Request)()), _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0]), _dec0 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec1 = (0, _common.Put)(), _dec10 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Body)()), _dec11 = Reflect.metadata("design:type", Function), _dec12 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec13 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec14 = (0, _common.Put)('password'), _dec15 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Body)()), _dec16 = Reflect.metadata("design:type", Function), _dec17 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec18 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec19 = (0, _common.Put)('email'), _dec20 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Body)()), _dec21 = Reflect.metadata("design:type", Function), _dec22 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec23 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec24 = (0, _common.Put)('reset-defaults/:section'), _dec25 = (0, _common.Bind)((0, _common.Request)(), (0, _common.Param)('section')), _dec26 = Reflect.metadata("design:type", Function), _dec27 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec28 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec29 = (0, _common.Delete)('account'), _dec30 = (0, _common.Bind)((0, _common.Request)()), _dec31 = Reflect.metadata("design:type", Function), _dec32 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = class SettingsController {
  constructor(settingsService) {
    this.settingsService = settingsService;
  }
  async getSettings(req) {
    return this.settingsService.getUserSettings(req.user.id);
  }
  async updateSettings(req, settingsDto) {
    return this.settingsService.updateUserSettings(req.user.id, settingsDto);
  }
  async changePassword(req, passwordData) {
    return this.settingsService.changePassword(req.user.id, passwordData);
  }
  async changeEmail(req, emailData) {
    return this.settingsService.changeEmail(req.user.id, emailData);
  }
  async resetToDefaults(req, section) {
    return this.settingsService.resetToDefaults(req.user.id, section);
  }
  async deleteAccount(req) {
    return this.settingsService.deleteUserAccount(req.user.id);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getSettings", [_dec5, _dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getSettings"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updateSettings", [_dec0, _dec1, _dec10, _dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "updateSettings"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "changePassword", [_dec13, _dec14, _dec15, _dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "changePassword"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "changeEmail", [_dec18, _dec19, _dec20, _dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "changeEmail"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "resetToDefaults", [_dec23, _dec24, _dec25, _dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "resetToDefaults"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deleteAccount", [_dec28, _dec29, _dec30, _dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteAccount"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class);