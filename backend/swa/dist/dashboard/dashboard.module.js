"use strict";

exports.__esModule = true;
exports.DashboardModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _dashboardService = require("./dashboard.service.js");
var _dashboardController = require("./dashboard.controller.js");
var _itemEntity = require("../item/entities/item.entity.js");
var _outfitEntity = require("../outfit/entities/outfit.entity.js");
var _userEntity = require("../user/entities/user.entity.js");
var _analyticsModule = require("../analytics/analytics.module.js");
var _dec, _class;
let DashboardModule = exports.DashboardModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_itemEntity.Item, _outfitEntity.Outfit, _userEntity.User]), _analyticsModule.AnalyticsModule],
  providers: [_dashboardService.DashboardService],
  controllers: [_dashboardController.DashboardController],
  exports: [_dashboardService.DashboardService]
}), _dec(_class = class DashboardModule {}) || _class);