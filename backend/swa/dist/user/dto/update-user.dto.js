"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.UpdateUserDTO = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _classValidator = require("class-validator");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
let UpdateUserDTO = exports.UpdateUserDTO = (_dec = (0, _classValidator.IsOptional)(), _dec2 = (0, _classValidator.IsString)({
  message: 'First name must be a string'
}), _dec3 = (0, _classValidator.IsOptional)(), _dec4 = (0, _classValidator.IsString)({
  message: 'Last name must be a string'
}), _dec5 = (0, _classValidator.IsOptional)(), _dec6 = (0, _classValidator.IsEmail)({}, {
  message: 'Email must be valid'
}), _dec7 = (0, _classValidator.IsOptional)(), _dec8 = (0, _classValidator.IsString)({
  message: 'Password must be a string'
}), _dec9 = (0, _classValidator.IsOptional)(), _dec0 = (0, _classValidator.IsBoolean)({
  message: 'Trial must be a boolean value'
}), _dec1 = (0, _classValidator.IsOptional)(), _dec10 = (0, _classValidator.IsDateString)({}, {
  message: 'Trial expiration must be a valid date'
}), _dec11 = (0, _classValidator.IsOptional)(), _dec12 = (0, _classValidator.IsString)({
  message: 'Base location must be a string'
}), _class = class UpdateUserDTO {
  constructor(data = {}) {
    (0, _initializerDefineProperty2.default)(this, "firstName", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "lastName", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "email", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "password", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "trial", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "trialExpires", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "baseLocation", _descriptor7, this);
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.trial = data.trial;
    this.trialExpires = data.trialExpires;
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "firstName", [_dec, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "lastName", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "email", [_dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "password", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "trial", [_dec9, _dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "trialExpires", [_dec1, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "baseLocation", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class);