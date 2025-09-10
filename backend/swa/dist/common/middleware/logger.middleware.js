"use strict";

exports.__esModule = true;
exports.LoggerMiddleware = void 0;
var _common = require("@nestjs/common");
var _dec, _dec2, _dec3, _class;
let LoggerMiddleware = exports.LoggerMiddleware = (_dec = (0, _common.Injectable)(), _dec2 = Reflect.metadata("design:type", Function), _dec3 = Reflect.metadata("design:paramtypes", []), _dec(_class = _dec2(_class = _dec3(_class = class LoggerMiddleware {
  constructor() {
    this.logger = new _common.Logger('HTTP');
  }
  use(req, res, next) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}) || _class) || _class) || _class);