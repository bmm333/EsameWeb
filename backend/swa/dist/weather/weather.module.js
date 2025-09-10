"use strict";

exports.__esModule = true;
exports.WeatherModule = void 0;
var _common = require("@nestjs/common");
var _weatherService = require("./weather.service.js");
var _weatherController = require("./weather.controller.js");
var _dec, _class;
let WeatherModule = exports.WeatherModule = (_dec = (0, _common.Module)({
  imports: [],
  providers: [_weatherService.WeatherService],
  exports: [_weatherService.WeatherService],
  controllers: [_weatherController.WeatherController]
}), _dec(_class = class WeatherModule {}) || _class);