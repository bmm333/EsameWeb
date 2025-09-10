"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.Item = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
var _typeorm = require("typeorm");
var _userEntity = require("../../user/entities/user.entity.js");
var _rfidTagEntity = require("../../rfid/entities/rfid-tag.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18;
let Item = exports.Item = (_dec = (0, _typeorm.Entity)('items'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec3 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100
}), _dec4 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'dresses', 'bags']
}), _dec5 = (0, _typeorm.Column)({
  type: 'varchar',
  nullable: true
}), _dec6 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['wardrobe', 'being_worn'],
  default: 'wardrobe'
}), _dec7 = (0, _typeorm.Column)({
  type: 'int',
  default: 0
}), _dec8 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec9 = (0, _typeorm.Column)({
  type: 'json',
  nullable: true
}), _dec0 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec1 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 50,
  nullable: true
}), _dec10 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['casual', 'formal', 'sporty'],
  nullable: true
}), _dec11 = (0, _typeorm.Column)({
  type: 'json',
  nullable: true
}), _dec12 = (0, _typeorm.Column)({
  type: 'text',
  nullable: true
}), _dec13 = (0, _typeorm.CreateDateColumn)(), _dec14 = (0, _typeorm.UpdateDateColumn)(), _dec15 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec16 = (0, _typeorm.ManyToOne)(() => _userEntity.User, {
  onDelete: 'CASCADE'
}), _dec17 = (0, _typeorm.JoinColumn)({
  name: 'userId'
}), _dec18 = (0, _typeorm.Column)({
  type: 'int'
}), _dec19 = (0, _typeorm.OneToOne)(() => _rfidTagEntity.RfidTag, tag => tag.item, {
  nullable: true,
  onDelete: 'SET NULL',
  cascade: ['update']
}), _dec20 = (0, _typeorm.JoinColumn)({
  name: 'rfidTagId'
}), _dec21 = (0, _typeorm.Column)({
  type: 'int',
  nullable: true
}), _dec(_class = (_class2 = class Item {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "name", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "category", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "imageUrl", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "location", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "wearCount", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "lastWorn", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "wearHistory", _descriptor8, this);
    (0, _initializerDefineProperty2.default)(this, "isFavorite", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "color", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "occasion", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "season", _descriptor10, this);
    // Array: ['spring', 'summer', etc.]
    (0, _initializerDefineProperty2.default)(this, "notes", _descriptor11, this);
    (0, _initializerDefineProperty2.default)(this, "dateAdded", _descriptor12, this);
    (0, _initializerDefineProperty2.default)(this, "lastUpdated", _descriptor13, this);
    (0, _initializerDefineProperty2.default)(this, "lastLocationUpdate", _descriptor14, this);
    (0, _initializerDefineProperty2.default)(this, "user", _descriptor15, this);
    (0, _initializerDefineProperty2.default)(this, "userId", _descriptor16, this);
    (0, _initializerDefineProperty2.default)(this, "rfidTag", _descriptor17, this);
    (0, _initializerDefineProperty2.default)(this, "rfidTagId", _descriptor18, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "name", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "category", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "imageUrl", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "location", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wearCount", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastWorn", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "wearHistory", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isFavorite", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "color", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "occasion", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "season", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "notes", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "dateAdded", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastUpdated", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastLocationUpdate", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "user", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "userId", [_dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rfidTag", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rfidTagId", [_dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class);