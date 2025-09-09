"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.Recommendation = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _itemEntity = require("../../item/entities/item.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11;
let Recommendation = exports.Recommendation = (_dec = (0, _typeorm.Entity)('recommendations'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec3 = (0, _typeorm.Column)({
  type: 'int'
}), _dec4 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100
}), _dec5 = (0, _typeorm.Column)({
  type: 'text',
  nullable: true
}), _dec6 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100,
  nullable: true
}), _dec7 = (0, _typeorm.Column)({
  type: 'text',
  nullable: true
}), _dec8 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec9 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec0 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true,
  name: 'rejectedAt'
}), _dec1 = (0, _typeorm.Column)({
  type: 'text',
  nullable: true,
  name: 'rejectionReason'
}), _dec10 = (0, _typeorm.CreateDateColumn)({
  type: 'timestamp'
}), _dec11 = (0, _typeorm.ManyToOne)(() => _userEntity.User, user => user.recommendations), _dec12 = (0, _typeorm.ManyToMany)(() => _itemEntity.Item), _dec13 = (0, _typeorm.JoinTable)({
  name: 'recommendation_items',
  joinColumn: {
    name: 'recommendationId',
    referencedColumnName: 'id'
  },
  inverseJoinColumn: {
    name: 'itemId',
    referencedColumnName: 'id'
  }
}), _dec(_class = (_class2 = class Recommendation {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "title", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "reason", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "occasion", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "imageUrl", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "wasWorn", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "wornAt", _descriptor8, this);
    (0, _initializerDefineProperty2.default)(this, "rejectedAt", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "rejectionReason", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "createdAt", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor10, this);
    (0, _initializerDefineProperty2.default)(this, "items", _descriptor11, this);
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
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "title", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "reason", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "occasion", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "imageUrl", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wasWorn", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wornAt", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rejectedAt", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rejectionReason", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "createdAt", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "items", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class);