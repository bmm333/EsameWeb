"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.DashboardController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _jwtAuth = require("../auth/guards/jwt-auth.guard");
var _dashboard = require("./dashboard.service");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2;
let DashboardController = exports.DashboardController = (_dec = (0, _common.Controller)('dashboard'), _dec2 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec3 = (0, _common.Dependencies)(_dashboard.DashboardService), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0]), _dec6 = (0, _common.Get)('stats'), _dec7 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0]), _dec0 = (0, _common.Get)('outfit'), _dec1 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec10 = Reflect.metadata("design:type", Function), _dec11 = Reflect.metadata("design:paramtypes", [void 0]), _dec12 = (0, _common.Get)('activity'), _dec13 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec14 = Reflect.metadata("design:type", Function), _dec15 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class DashboardController {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }
  async getStats(req) {
    try {
      const userId = req.user.id;
      console.log('Getting stats for user:', userId);
      const stats = await this.dashboardService.getStats(userId);
      console.log('Response data:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalItems: 0,
        totalOutfits: 0,
        availableItems: 0,
        wornItems: 0
      };
    }
  }
  async getTodaysOutfit(req) {
    try {
      const userId = req.user.id;
      console.log('Getting today\'s outfit for user:', userId);
      return await this.dashboardService.getTodaysOutfit(userId);
    } catch (error) {
      console.error('Error in getTodaysOutfit:', error);
      return {
        hasOutfit: false,
        message: 'Unable to load outfit suggestions at this time'
      };
    }
  }
  async getActivity(req) {
    try {
      const userId = req.user.id;
      console.log('Getting activity for user:', userId);
      return await this.dashboardService.getRecentActivity(userId);
    } catch (error) {
      console.error('Error in getActivity:', error);
      return [];
    }
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getStats", [_dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getStats"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getTodaysOutfit", [_dec0, _dec1, _dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "getTodaysOutfit"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getActivity", [_dec12, _dec13, _dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "getActivity"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);