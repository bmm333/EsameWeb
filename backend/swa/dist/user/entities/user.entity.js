"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.User = void 0;
var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));
require("reflect-metadata");
var _typeorm = require("typeorm");
var _rfidDeviceEntity = require("../../rfid/entities/rfid-device.entity.js");
var _rfidTagEntity = require("../../rfid/entities/rfid-tag.entity.js");
var _itemEntity = require("../../item/entities/item.entity.js");
var _userStylePreferencesEntity = require("./user-style-preferences.entity.js");
var _userColorPreferencesEntity = require("./user-color-preferences.entity.js");
var _userLifestyleEntity = require("./user-lifestyle.entity.js");
var _userOccasionEntity = require("./user-occasion.entity.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39;
let User = exports.User = (_dec = (0, _typeorm.Entity)('user'), _dec2 = (0, _typeorm.Index)(['email']), _dec3 = (0, _typeorm.PrimaryGeneratedColumn)(), _dec4 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 50
}), _dec5 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 50
}), _dec6 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100,
  unique: true
}), _dec7 = (0, _typeorm.Column)({
  type: 'varchar'
}), _dec8 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 15,
  nullable: true
}), _dec9 = (0, _typeorm.Column)({
  type: 'date',
  nullable: true
}), _dec0 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
  nullable: true
}), _dec1 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec10 = (0, _typeorm.Column)({
  type: 'varchar',
  nullable: true
}), _dec11 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec12 = (0, _typeorm.Column)({
  type: 'boolean',
  nullable: false,
  default: false
}), _dec13 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec14 = (0, _typeorm.Column)({
  type: 'varchar',
  nullable: true
}), _dec15 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec16 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec17 = (0, _typeorm.Column)({
  type: 'integer',
  default: 0
}), _dec18 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec19 = (0, _typeorm.Column)({
  type: 'varchar',
  nullable: true
}), _dec20 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 100,
  nullable: true
}), _dec21 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec22 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec23 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['free', 'trial'],
  default: 'free'
}), _dec24 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec25 = (0, _typeorm.Column)({
  type: 'boolean',
  default: false
}), _dec26 = (0, _typeorm.Column)({
  type: 'integer',
  default: 0
}), _dec27 = (0, _typeorm.Column)({
  type: 'integer',
  default: 0
}), _dec28 = (0, _typeorm.Column)({
  type: 'enum',
  enum: ['local'],
  default: 'local'
}), _dec29 = (0, _typeorm.Column)({
  type: 'varchar',
  nullable: true
}), _dec30 = (0, _typeorm.CreateDateColumn)(), _dec31 = (0, _typeorm.UpdateDateColumn)(), _dec32 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec33 = (0, _typeorm.Column)({
  type: 'varchar',
  length: 20,
  default: 'none'
}), _dec34 = (0, _typeorm.Column)({
  type: 'timestamp',
  nullable: true
}), _dec35 = (0, _typeorm.OneToMany)(() => _rfidDeviceEntity.RfidDevice, device => device.user), _dec36 = (0, _typeorm.OneToMany)(() => _rfidTagEntity.RfidTag, tag => tag.user), _dec37 = (0, _typeorm.OneToMany)(() => _itemEntity.Item, item => item.user), _dec38 = (0, _typeorm.OneToMany)(() => _userStylePreferencesEntity.UserStylePreference, pref => pref.user), _dec39 = (0, _typeorm.OneToMany)(() => _userColorPreferencesEntity.UserColorPreference, pref => pref.user), _dec40 = (0, _typeorm.OneToMany)(() => _userLifestyleEntity.UserLifestyle, lifestyle => lifestyle.user), _dec41 = (0, _typeorm.OneToMany)(() => _userOccasionEntity.UserOccasion, occasion => occasion.user), _dec(_class = _dec2(_class = (_class2 = class User {
  constructor() {
    (0, _initializerDefineProperty2.default)(this, "id", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "firstName", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "lastName", _descriptor3, this);
    (0, _initializerDefineProperty2.default)(this, "email", _descriptor4, this);
    (0, _initializerDefineProperty2.default)(this, "password", _descriptor5, this);
    (0, _initializerDefineProperty2.default)(this, "phoneNumber", _descriptor6, this);
    (0, _initializerDefineProperty2.default)(this, "dateOfBirth", _descriptor7, this);
    (0, _initializerDefineProperty2.default)(this, "gender", _descriptor8, this);
    (0, _initializerDefineProperty2.default)(this, "isVerified", _descriptor9, this);
    (0, _initializerDefineProperty2.default)(this, "verificationToken", _descriptor0, this);
    (0, _initializerDefineProperty2.default)(this, "verificationTokenExpires", _descriptor1, this);
    (0, _initializerDefineProperty2.default)(this, "profileSetupCompleted", _descriptor10, this);
    (0, _initializerDefineProperty2.default)(this, "profileSetupCompletedAt", _descriptor11, this);
    (0, _initializerDefineProperty2.default)(this, "resetPasswordToken", _descriptor12, this);
    (0, _initializerDefineProperty2.default)(this, "resetPasswordExpires", _descriptor13, this);
    (0, _initializerDefineProperty2.default)(this, "passwordChangedAt", _descriptor14, this);
    (0, _initializerDefineProperty2.default)(this, "failedLoginAttempts", _descriptor15, this);
    (0, _initializerDefineProperty2.default)(this, "lockedUntil", _descriptor16, this);
    (0, _initializerDefineProperty2.default)(this, "refreshToken", _descriptor17, this);
    (0, _initializerDefineProperty2.default)(this, "location", _descriptor18, this);
    (0, _initializerDefineProperty2.default)(this, "trial", _descriptor19, this);
    (0, _initializerDefineProperty2.default)(this, "trialExpires", _descriptor20, this);
    (0, _initializerDefineProperty2.default)(this, "subscriptionTier", _descriptor21, this);
    (0, _initializerDefineProperty2.default)(this, "subscriptionExpires", _descriptor22, this);
    (0, _initializerDefineProperty2.default)(this, "hasRfidDevice", _descriptor23, this);
    (0, _initializerDefineProperty2.default)(this, "trialItemsUsed", _descriptor24, this);
    (0, _initializerDefineProperty2.default)(this, "trialOutfitsUsed", _descriptor25, this);
    (0, _initializerDefineProperty2.default)(this, "provider", _descriptor26, this);
    (0, _initializerDefineProperty2.default)(this, "profilePicture", _descriptor27, this);
    (0, _initializerDefineProperty2.default)(this, "createdAt", _descriptor28, this);
    (0, _initializerDefineProperty2.default)(this, "updatedAt", _descriptor29, this);
    (0, _initializerDefineProperty2.default)(this, "lastLoginAt", _descriptor30, this);
    (0, _initializerDefineProperty2.default)(this, "deviceSetupStatus", _descriptor31, this);
    (0, _initializerDefineProperty2.default)(this, "deviceSetupCompletedAt", _descriptor32, this);
    (0, _initializerDefineProperty2.default)(this, "rfidDevices", _descriptor33, this);
    (0, _initializerDefineProperty2.default)(this, "rfidTags", _descriptor34, this);
    (0, _initializerDefineProperty2.default)(this, "items", _descriptor35, this);
    (0, _initializerDefineProperty2.default)(this, "stylePreferences", _descriptor36, this);
    (0, _initializerDefineProperty2.default)(this, "colorPreferences", _descriptor37, this);
    (0, _initializerDefineProperty2.default)(this, "lifestyles", _descriptor38, this);
    (0, _initializerDefineProperty2.default)(this, "occasions", _descriptor39, this);
  }
}, _descriptor = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "firstName", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastName", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "email", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "password", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "phoneNumber", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "dateOfBirth", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "gender", [_dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "isVerified", [_dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "verificationToken", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "verificationTokenExpires", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "profileSetupCompleted", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "profileSetupCompletedAt", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "resetPasswordToken", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "resetPasswordExpires", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "passwordChangedAt", [_dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "failedLoginAttempts", [_dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lockedUntil", [_dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "refreshToken", [_dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "location", [_dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "trial", [_dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "trialExpires", [_dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "subscriptionTier", [_dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "subscriptionExpires", [_dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor23 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "hasRfidDevice", [_dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor24 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "trialItemsUsed", [_dec26], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor25 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "trialOutfitsUsed", [_dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor26 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "provider", [_dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor27 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "profilePicture", [_dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor28 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "createdAt", [_dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor29 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updatedAt", [_dec31], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor30 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lastLoginAt", [_dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor31 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deviceSetupStatus", [_dec33], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor32 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deviceSetupCompletedAt", [_dec34], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor33 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rfidDevices", [_dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor34 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rfidTags", [_dec36], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor35 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "items", [_dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor36 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "stylePreferences", [_dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor37 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "colorPreferences", [_dec39], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor38 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lifestyles", [_dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor39 = (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "occasions", [_dec41], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);