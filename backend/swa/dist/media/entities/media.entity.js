"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.Media = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11;
let Media = exports.Media = (_dec = (0, _typeorm.Entity)('media'), _dec2 = (0, _typeorm.Index)(['userId']), _dec3 = (0, _typeorm.Index)(['folder']), _dec4 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec5 = (0, _typeorm.Column)({
  type: 'int'
}), _dec6 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 255
}), _dec7 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 500
}), _dec8 = (0, _typeorm.Column)({
  type: 'text'
}), _dec9 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100
}), _dec0 = (0, _typeorm.Column)({
  type: 'int'
}), _dec1 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 50,
  default: 'general'
}), _dec10 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec11 = (0, _typeorm.Column)({
  type: 'json',
  nullable: true
}), _dec12 = (0, _typeorm.CreateDateColumn)(), _dec13 = (0, _typeorm.UpdateDateColumn)(), _dec14 = (0, _typeorm.ManyToOne)(() => _userEntity.User, {
  onDelete: 'CASCADE'
}), _dec15 = (0, _typeorm.JoinColumn)({
  name: 'userId'
}), _dec(_class = _dec2(_class = _dec3(_class = (_class2 = class Media {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "originalName", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "fileName", _descriptor4, this);
    // S3 key
    (0, _initializerDefineProperty2.default)(this, "url", _descriptor5, this);
    // S3 URL
    (0, _initializerDefineProperty2.default)(this, "mimeType", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "size", _descriptor7, this);
    //bytes
    (0, _initializerDefineProperty2.default)(this, "folder", _descriptor8, this);
    // profiles, items
    (0, _initializerDefineProperty2.default)(this, "backgroundRemoved", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "metadata", _descriptor0, this);
    // Additional data like dimensions, tags, etc.
    (0, _initializerDefineProperty2.default)(this, "createdAt", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "updatedAt", _descriptor10, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor11, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "originalName", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "fileName", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "url", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "mimeType", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "size", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "folder", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "backgroundRemoved", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "metadata", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "createdAt", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updatedAt", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);