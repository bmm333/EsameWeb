"use strict";

exports.__esModule = true;
exports.MediaModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _mediaController = require("./media.controller.js");
var _mediaService = require("./media.service.js");
var _mediaEntity = require("./entities/media.entity.js");
var _dec, _class;
let MediaModule = exports.MediaModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_mediaEntity.Media])],
  controllers: [_mediaController.MediaController],
  providers: [_mediaService.MediaService],
  exports: [_mediaService.MediaService]
}), _dec(_class = class MediaModule {}) || _class);