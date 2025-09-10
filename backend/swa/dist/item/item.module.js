"use strict";

exports.__esModule = true;
exports.ItemModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _itemController = require("./item.controller.js");
var _itemService = require("./item.service.js");
var _itemEntity = require("./entities/item.entity.js");
var _rfidTagEntity = require("../rfid/entities/rfid-tag.entity.js");
var _mediaModule = require("../media/media.module.js");
var _userModule = require("../user/user.module.js");
var _userEntity = require("../user/entities/user.entity.js");
var _dec, _class;
let ItemModule = exports.ItemModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_itemEntity.Item, _rfidTagEntity.RfidTag]), _mediaModule.MediaModule, _userModule.UserModule],
  controllers: [_itemController.ItemController],
  providers: [_itemService.ItemService],
  exports: [_itemService.ItemService]
}), _dec(_class = class ItemModule {}) || _class);