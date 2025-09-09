"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.UserStylePreference = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("./user.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
let UserStylePreference = exports.UserStylePreference = (_dec = (0, _typeorm.Entity)('user_style_preferences'), _dec2 = (0, _typeorm.Index)(['userId', 'style']), _dec3 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec4 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['casual', 'formal', 'business', 'sporty', 'trendy', 'classic']
}), _dec5 = (0, _typeorm.Column)({
  type: 'int',
  default: 1
}), _dec6 = (0, _typeorm.CreateDateColumn)(), _dec7 = (0, _typeorm.ManyToOne)(() => _userEntity.User, user => user.stylePreferences, {
  onDelete: 'CASCADE'
}), _dec8 = (0, _typeorm.JoinColumn)({
  name: 'userId'
}), _dec9 = (0, _typeorm.Column)({
  type: 'int'
}), _dec(_class = _dec2(_class = (_class2 = class UserStylePreference {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "style", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "priority", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "createdAt", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor6, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "style", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "priority", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "createdAt", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);