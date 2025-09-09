"use strict";

exports.__esModule = true;
exports.AppService = void 0;
var _common = require("@nestjs/common");
var _dec, _class;
let AppService = exports.AppService = (_dec = (0, _common.Injectable)(), _dec(_class = class AppService {
  getHello() {
    return 'Hello Not World!';
  }
}) || _class);