"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.Outfit = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
let Outfit = exports.Outfit = (_dec = (0, _typeorm.Entity)('outfits'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec3 = (0, _typeorm.Column)({
  type: 'int'
}), _dec4 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 255
}), _dec5 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['casual', 'work', 'formal', 'sport', 'party'],
  nullable: true
}), _dec6 = (0, _typeorm.Column)({
  type: 'text',
  nullable: true
}), _dec7 = (0, _typeorm.Column)({
  type: 'json',
  nullable: true
}), _dec8 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec9 = (0, _typeorm.Column)({
  type: 'int',
  default: 0
}), _dec0 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec1 = (0, _typeorm.Column)({
  type: 'json',
  nullable: true
}), _dec10 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 255,
  nullable: true
}), _dec11 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 50,
  nullable: true
}), _dec12 = (0, _typeorm.Column)({
  type: 'boolean',
  default: true
}), _dec13 = (0, _typeorm.CreateDateColumn)(), _dec14 = (0, _typeorm.UpdateDateColumn)(), _dec15 = (0, _typeorm.ManyToOne)(() => _userEntity.User, user => user.outfits), _dec(_class = (_class2 = class Outfit {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "name", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "occasion", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "notes", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "items", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "isFavorite", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "wearCount", _descriptor8, this);
    (0, _initializerDefineProperty2.default)(this, "lastWorn", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "wearHistory", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "image", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "season", _descriptor10, this);
    (0, _initializerDefineProperty2.default)(this, "isAvailable", _descriptor11, this);
    (0, _initializerDefineProperty2.default)(this, "createdAt", _descriptor12, this);
    (0, _initializerDefineProperty2.default)(this, "updatedAt", _descriptor13, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor14, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "name", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "occasion", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "notes", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "items", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isFavorite", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wearCount", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastWorn", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wearHistory", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "image", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "season", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isAvailable", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "createdAt", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updatedAt", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class);