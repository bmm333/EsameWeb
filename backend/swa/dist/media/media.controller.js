"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.MediaController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _platformExpress = require("@nestjs/platform-express");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _mediaService = require("./media.service.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _class, _class2;
let MediaController = exports.MediaController = (_dec = (0, _common.Controller)('media'), _dec2 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec3 = (0, _common.Dependencies)(_mediaService.MediaService), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0]), _dec6 = (0, _common.Post)('upload'), _dec7 = (0, _common.UseInterceptors)((0, _platformExpress.FileInterceptor)('file', {
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new _common.BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})), _dec8 = (0, _common.Bind)((0, _common.Request)(), (0, _common.UploadedFile)(), (0, _common.Body)()), _dec9 = Reflect.metadata("design:type", Function), _dec0 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec1 = (0, _common.Post)('upload/profile'), _dec10 = (0, _common.UseInterceptors)((0, _platformExpress.FileInterceptor)('file')), _dec11 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec12 = function (target, key) {
  return (0, _common.UploadedFile)()(target, key, 1);
}, _dec13 = Reflect.metadata("design:type", Function), _dec14 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec15 = (0, _common.Post)('upload/item'), _dec16 = (0, _common.UseInterceptors)((0, _platformExpress.FileInterceptor)('file')), _dec17 = (0, _common.Bind)((0, _common.Request)(), (0, _common.UploadedFile)(), (0, _common.Body)()), _dec18 = Reflect.metadata("design:type", Function), _dec19 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec20 = (0, _common.Get)(), _dec21 = Reflect.metadata("design:type", Function), _dec22 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec23 = (0, _common.Delete)(':id'), _dec24 = Reflect.metadata("design:type", Function), _dec25 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class MediaController {
  constructor(mediaService) {
    this.mediaService = mediaService;
  }
  async uploadMedia(req, file, body) {
    console.log('Upload media request body:', body);
    const userId = req.user.id;
    const options = {
      folder: 'item',
      removeBackground: 'true',
      metadata: body.metadata ? JSON.parse(body.metadata) : {}
    };
    return this.mediaService.uploadImage(userId, file, options);
  }
  async uploadProfilePicture(req, file) {
    const userId = req.user.id;
    return this.mediaService.uploadImage(userId, file, {
      folder: 'profiles',
      removeBackground: false
    });
  }
  async uploadItemPhoto(req, file, body) {
    const userId = req.user.id;
    return this.mediaService.uploadImage(userId, file, {
      folder: 'items',
      removeBackground: body.removeBackground !== 'false',
      metadata: {
        itemId: body.itemId
      }
    });
  }
  async getUserMedia(req, query) {
    const userId = req.user.id;
    return this.mediaService.getUserMedia(userId, query.folder);
  }
  async deleteMedia(req, param) {
    const userId = req.user.id;
    return this.mediaService.deleteImage(param.id, userId);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "uploadMedia", [_dec6, _dec7, _dec8, _dec9, _dec0], Object.getOwnPropertyDescriptor(_class2.prototype, "uploadMedia"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "uploadProfilePicture", [_dec1, _dec10, _dec11, _dec12, _dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "uploadProfilePicture"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "uploadItemPhoto", [_dec15, _dec16, _dec17, _dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "uploadItemPhoto"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getUserMedia", [_dec20, _dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "getUserMedia"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deleteMedia", [_dec23, _dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteMedia"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);