"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.RfidDevice = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _rfidTagEntity = require("./rfid-tag.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
let RfidDevice = exports.RfidDevice = (_dec = (0, _typeorm.Entity)('rfid_devices'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec3 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100,
  unique: true,
  nullable: true
}), _dec4 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100,
  unique: true,
  nullable: true
}), _dec5 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100
}), _dec6 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec7 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec8 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec9 = (0, _typeorm.Column)({
  type: 'int',
  default: 30
}), _dec0 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec1 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec10 = (0, _typeorm.CreateDateColumn)(), _dec11 = (0, _typeorm.UpdateDateColumn)(), _dec12 = (0, _typeorm.ManyToOne)(() => _userEntity.User, {
  onDelete: 'CASCADE'
}), _dec13 = (0, _typeorm.JoinColumn)({
  name: 'userId'
}), _dec14 = (0, _typeorm.Column)({
  type: 'int',
  nullable: true
}), _dec15 = (0, _typeorm.OneToMany)(() => _rfidTagEntity.RfidTag, tag => tag.device), _dec(_class = (_class2 = class RfidDevice {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "serialNumber", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "apiKey", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "deviceName", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "lastHeartbeat", _descriptor5, this);
    // Last ping from device
    (0, _initializerDefineProperty2.default)(this, "lastScan", _descriptor6, this);
    // Last RFID scan
    (0, _initializerDefineProperty2.default)(this, "isOnline", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "scanInterval", _descriptor8, this);
    // Seconds between scans
    (0, _initializerDefineProperty2.default)(this, "powerSavingMode", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "lastConfigured", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "registeredAt", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "lastUpdated", _descriptor10, this);
    // Relations
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor11, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor12, this);
    (0, _initializerDefineProperty2.default)(this, "tags", _descriptor13, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "serialNumber", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "apiKey", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deviceName", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastHeartbeat", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastScan", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isOnline", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "scanInterval", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "powerSavingMode", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastConfigured", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "registeredAt", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastUpdated", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "tags", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class);