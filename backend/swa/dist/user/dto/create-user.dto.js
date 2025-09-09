"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.CreateUserDto = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
require("reflect-metadata");
var _classValidator = require("class-validator");
var _classTransformer = require("class-transformer");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
let CreateUserDto = exports.CreateUserDto = (_dec = (0, _classValidator.IsDefined)({
  message: 'First name is required'
}), _dec2 = (0, _classValidator.IsString)({
  message: 'First name must be a string'
}), _dec3 = (0, _classValidator.MinLength)(1, {
  message: 'First name cannot be empty'
}), _dec4 = (0, _classTransformer.Transform)(({
  value
}) => value?.trim()), _dec5 = (0, _classValidator.IsOptional)(), _dec6 = (0, _classValidator.IsString)({
  message: 'Last name must be a string'
}), _dec7 = (0, _classTransformer.Transform)(({
  value
}) => value?.trim() || ''), _dec8 = (0, _classValidator.IsDefined)({
  message: 'Email is required'
}), _dec9 = (0, _classValidator.IsEmail)({}, {
  message: 'Email must be valid'
}), _dec0 = (0, _classTransformer.Transform)(({
  value
}) => value?.toLowerCase().trim()), _dec1 = (0, _classValidator.IsDefined)({
  message: 'Password is required'
}), _dec10 = (0, _classValidator.IsString)({
  message: 'Password must be a string'
}), _dec11 = (0, _classValidator.MinLength)(8, {
  message: 'Password must be at least 8 characters long'
}), _dec12 = (0, _classValidator.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
}), _dec13 = (0, _classValidator.IsOptional)(), _dec14 = (0, _classValidator.IsPhoneNumber)('ZZ', {
  message: 'Invalid phone number format'
}), _dec15 = (0, _classValidator.IsOptional)(), _dec16 = (0, _classValidator.IsDateString)({}, {
  message: 'Date of birth must be a valid date'
}), _dec17 = (0, _classValidator.IsOptional)(), _dec18 = (0, _classValidator.IsEnum)(['male', 'female']), _class = class CreateUserDto {
  constructor(data = {}) {
    (0, _initializerDefineProperty2.default)(this, "firstName", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "lastName", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "email", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "password", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "phoneNumber", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "dateOfBirth", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "gender", _descriptor7, this);
    Object.assign(this, data);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "firstName", [_dec, _dec2, _dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "lastName", [_dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "email", [_dec8, _dec9, _dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "password", [_dec1, _dec10, _dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "phoneNumber", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "dateOfBirth", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "gender", [_dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class);