"use strict";

exports.__esModule = true;
exports.RfidModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _rfidController = require("./rfid.controller.js");
var _rfidService = require("./rfid.service.js");
var _rfidDeviceEntity = require("./entities/rfid-device.entity.js");
var _rfidTagEntity = require("./entities/rfid-tag.entity.js");
var _itemEntity = require("../item/entities/item.entity.js");
var _userModule = require("../user/user.module.js");
var _dec, _class;
let RfidModule = exports.RfidModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_rfidDeviceEntity.RfidDevice, _rfidTagEntity.RfidTag, _itemEntity.Item]), _userModule.UserModule],
  controllers: [_rfidController.RfidController],
  providers: [_rfidService.RfidService],
  exports: [_rfidService.RfidService]
}), _dec(_class = class RfidModule {}) || _class);