"use strict";

exports.__esModule = true;
exports.AnalyticsModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _analyticsService = require("./analytics.service.js");
var _analyticsController = require("./analytics.controller.js");
var _itemEntity = require("../item/entities/item.entity.js");
var _outfitEntity = require("../outfit/entities/outfit.entity.js");
var _userEntity = require("../user/entities/user.entity.js");
var _dec, _class;
let AnalyticsModule = exports.AnalyticsModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_itemEntity.Item, _outfitEntity.Outfit, _userEntity.User])],
  providers: [_analyticsService.AnalyticsService],
  controllers: [_analyticsController.AnalyticsController],
  exports: [_analyticsService.AnalyticsService]
}), _dec(_class = class AnalyticsModule {}) || _class);