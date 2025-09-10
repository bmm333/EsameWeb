"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.AppController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _app = require("./app.service");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2;
let AppController = exports.AppController = (_dec = (0, _common.Controller)(), _dec2 = (0, _common.Dependencies)(_app.AppService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec5 = (0, _common.Get)(), _dec6 = Reflect.metadata("design:type", Function), _dec7 = Reflect.metadata("design:paramtypes", []), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = class AppController {
  constructor(appService) {
    this.appService = appService;
  }
  getHello() {
    return this.appService.getHello();
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getHello", [_dec5, _dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "getHello"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class);