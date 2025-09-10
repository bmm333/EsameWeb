"use strict";

exports.__esModule = true;
exports.OutfitModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _outfitService = require("./outfit.service.js");
var _outfitController = require("./outfit.controller.js");
var _outfitEntity = require("./entities/outfit.entity.js");
var _itemEntity = require("../item/entities/item.entity.js");
var _userModule = require("../user/user.module.js");
var _dec, _class;
let OutfitModule = exports.OutfitModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_outfitEntity.Outfit, _itemEntity.Item]), _userModule.UserModule],
  providers: [_outfitService.OutfitService],
  controllers: [_outfitController.OutfitController],
  exports: [_outfitService.OutfitService]
}), _dec(_class = class OutfitModule {}) || _class);