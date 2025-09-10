"use strict";

exports.__esModule = true;
exports.MailingModule = void 0;
var _mailing = require("./mailing.service");
var _common = require("@nestjs/common");
var _dec, _class;
let MailingModule = exports.MailingModule = (_dec = (0, _common.Module)({
  providers: [_mailing.MailingService],
  exports: [_mailing.MailingService]
}), _dec(_class = class MailingModule {}) || _class);