"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.RfidTag = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _itemEntity = require("../../item/entities/item.entity.js");
var _rfidDeviceEntity = require("./rfid-device.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
let RfidTag = exports.RfidTag = (_dec = (0, _typeorm.Entity)('rfid_tags'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec3 = (0, _typeorm.Column)({
  type: 'varchar',
  unique: true
}), _dec4 = (0, _typeorm.Column)({
  type: 'varchar',
  default: 'detected'
}), _dec5 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['wardrobe', 'being_worn'],
  default: 'wardrobe'
}), _dec6 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec7 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec8 = (0, _typeorm.Column)({
  type: 'int',
  default: 0
}), _dec9 = (0, _typeorm.Column)({
  type: 'boolean',
  default: true
}), _dec0 = (0, _typeorm.CreateDateColumn)(), _dec1 = (0, _typeorm.UpdateDateColumn)(), _dec10 = (0, _typeorm.ManyToOne)(() => _userEntity.User, {
  onDelete: 'CASCADE'
}), _dec11 = (0, _typeorm.JoinColumn)({
  name: 'userId'
}), _dec12 = (0, _typeorm.Column)({
  type: 'int'
}), _dec13 = (0, _typeorm.OneToOne)(() => _itemEntity.Item, item => item.rfidTag, {
  nullable: true,
  onDelete: 'SET NULL',
  cascade: ['update'] //updates cascade
}), _dec14 = (0, _typeorm.JoinColumn)({
  name: 'itemId'
}), _dec15 = (0, _typeorm.Column)({
  type: 'int',
  nullable: true
}), _dec16 = (0, _typeorm.ManyToOne)(() => _rfidDeviceEntity.RfidDevice, device => device.tags, {
  onDelete: 'CASCADE'
}), _dec17 = (0, _typeorm.JoinColumn)({
  name: 'deviceId'
}), _dec18 = (0, _typeorm.Column)({
  type: 'int'
}), _dec(_class = (_class2 = class RfidTag {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "tagId", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "status", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "location", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "lastDetected", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "lastSeen", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "signalStrength", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "isActive", _descriptor8, this);
    (0, _initializerDefineProperty2.default)(this, "registeredAt", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "lastUpdated", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor10, this);
    (0, _initializerDefineProperty2.default)(this, "item", _descriptor11, this);
    (0, _initializerDefineProperty2.default)(this, "itemId", _descriptor12, this);
    (0, _initializerDefineProperty2.default)(this, "device", _descriptor13, this);
    (0, _initializerDefineProperty2.default)(this, "deviceId", _descriptor14, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "tagId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "status", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "location", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastDetected", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastSeen", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "signalStrength", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isActive", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "registeredAt", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastUpdated", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "item", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "itemId", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "device", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deviceId", [_dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class);