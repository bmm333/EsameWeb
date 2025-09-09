"use strict";

exports.__esModule = true;
exports.LocalAuthGuard = void 0;
var _common = require("@nestjs/common");
var _passport = require("@nestjs/passport");
var _dec, _class;
let LocalAuthGuard = exports.LocalAuthGuard = (_dec = (0, _common.Injectable)(), _dec(_class = class LocalAuthGuard extends (0, _passport.AuthGuard)('local') {}) || _class);