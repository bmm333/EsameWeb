"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.UserProfileSetupDto = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
require("reflect-metadata");
var _classValidator = require("class-validator");
var _classTransformer = require("class-transformer");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
let UserProfileSetupDto = exports.UserProfileSetupDto = (_dec = (0, _classValidator.IsOptional)(), _dec2 = (0, _classValidator.IsArray)({
  message: 'Style preferences must be an array'
}), _dec3 = (0, _classValidator.IsEnum)(['casual', 'formal', 'business', 'sporty', 'trendy', 'classic'], {
  each: true,
  message: 'Invalid style preference'
}), _dec4 = (0, _classValidator.IsOptional)(), _dec5 = (0, _classValidator.IsArray)({
  message: 'Color preferences must be an array'
}), _dec6 = (0, _classValidator.IsString)({
  each: true,
  message: 'Each color preference must be a string'
}), _dec7 = (0, _classValidator.IsOptional)(), _dec8 = (0, _classValidator.IsArray)(), _dec9 = (0, _classValidator.IsEnum)(['work', 'casual', 'formal-events', 'gym', 'travel'], {
  each: true,
  message: 'Invalid occasion'
}), _dec0 = (0, _classValidator.IsOptional)(), _dec1 = (0, _classValidator.IsString)(), _dec10 = (0, _classValidator.IsOptional)(), _dec11 = (0, _classValidator.IsString)(), _class = class UserProfileSetupDto {
  constructor(data = {}) {
    (0, _initializerDefineProperty2.default)(this, "stylePreferences", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "colorPreferences", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "occasions", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "baseLocation", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "profilePicture", _descriptor5, this);
    Object.assign(this, data);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "stylePreferences", [_dec, _dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "colorPreferences", [_dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "occasions", [_dec7, _dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "baseLocation", [_dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "profilePicture", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class);