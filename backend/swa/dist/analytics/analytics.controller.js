"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.AnalyticsController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _analyticsService = require("./analytics.service.js");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class, _class2;
let AnalyticsController = exports.AnalyticsController = (_dec = (0, _common.Controller)('analytics'), _dec2 = (0, _common.Dependencies)(_analyticsService.AnalyticsService), _dec3 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0]), _dec6 = (0, _common.Get)('basic-stats'), _dec7 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0]), _dec0 = (0, _common.Get)(), _dec1 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec10 = Reflect.metadata("design:type", Function), _dec11 = Reflect.metadata("design:paramtypes", [void 0]), _dec12 = (0, _common.Get)('insights'), _dec13 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec14 = Reflect.metadata("design:type", Function), _dec15 = Reflect.metadata("design:paramtypes", [void 0]), _dec16 = (0, _common.Get)('rarely-used'), _dec17 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec18 = Reflect.metadata("design:type", Function), _dec19 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }
  async getBasicStats(req) {
    const userId = req.user.id;
    return await this.analyticsService.getBasicWardrobeStats(userId);
  }
  async getAnalytics(req) {
    const userId = req.user.id;
    return await this.analyticsService.getWardrobeAnalytics(userId);
  }
  async getInsights(req) {
    const userId = req.user.id;
    return await this.analyticsService.getActionableInsights(userId);
  }
  async getRarelyUsed(req) {
    const userId = req.user.id;
    return await this.analyticsService.getRarelyUsedItems(userId);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getBasicStats", [_dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getBasicStats"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getAnalytics", [_dec0, _dec1, _dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "getAnalytics"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getInsights", [_dec12, _dec13, _dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "getInsights"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getRarelyUsed", [_dec16, _dec17, _dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getRarelyUsed"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);