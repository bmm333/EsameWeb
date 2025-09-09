"use strict";

exports.__esModule = true;
exports.SettingsModule = void 0;
var _common = require("@nestjs/common");
var _settingsController = require("./settings.controller.js");
var _settingsService = require("./settings.service.js");
var _userModule = require("../user/user.module.js");
var _authModule = require("../auth/auth.module.js");
var _mailingModule = require("../mailing/mailing.module.js");
var _dec, _class;
let SettingsModule = exports.SettingsModule = (_dec = (0, _common.Module)({
  imports: [_userModule.UserModule, _authModule.AuthModule, _mailingModule.MailingModule],
  controllers: [_settingsController.SettingsController],
  providers: [_settingsService.SettingService],
  exports: [_settingsService.SettingService]
}), _dec(_class = class SettingsModule {}) || _class);