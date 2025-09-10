"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.WeatherController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _weather = require("./weather.service");
var _jwtAuth = require("../auth/guards/jwt-auth.guard");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2;
let WeatherController = exports.WeatherController = (_dec = (0, _common.Controller)('weather'), _dec2 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard), _dec3 = (0, _common.Dependencies)(_weather.WeatherService), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0]), _dec6 = (0, _common.Get)('current'), _dec7 = function (target, key) {
  return (0, _common.Query)('location')(target, key, 0);
}, _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class WeatherController {
  constructor(weatherService) {
    this.weatherService = weatherService;
  }
  async currentWeather(location) {
    return this.weatherService.getCurrentWeather(location);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "currentWeather", [_dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "currentWeather"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);