"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.RfidController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _rfidService = require("./rfid.service.js");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _trialGuard = require("../common/guard/trial.guard.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _class, _class2;
let RfidController = exports.RfidController = (_dec = (0, _common.Controller)('rfid'), _dec2 = (0, _common.Dependencies)(_rfidService.RfidService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec5 = (0, _common.Post)('scan'), _dec6 = function (target, key) {
  return (0, _common.Headers)('x-api-key')(target, key, 0);
}, _dec7 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec8 = Reflect.metadata("design:type", Function), _dec9 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec0 = (0, _common.Get)('scan'), _dec1 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec10 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec11 = Reflect.metadata("design:type", Function), _dec12 = Reflect.metadata("design:paramtypes", [void 0]), _dec13 = (0, _common.Post)('scan/clear'), _dec14 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec15 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec16 = Reflect.metadata("design:type", Function), _dec17 = Reflect.metadata("design:paramtypes", [void 0]), _dec18 = (0, _common.Post)('association-mode'), _dec19 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec20 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec21 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec22 = Reflect.metadata("design:type", Function), _dec23 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec24 = (0, _common.Post)('tags/:tagId/associate'), _dec25 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec26 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec27 = function (target, key) {
  return (0, _common.Param)('tagId')(target, key, 1);
}, _dec28 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec29 = Reflect.metadata("design:type", Function), _dec30 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec31 = (0, _common.Post)('heartbeat'), _dec32 = function (target, key) {
  return (0, _common.Headers)('x-api-key')(target, key, 0);
}, _dec33 = Reflect.metadata("design:type", Function), _dec34 = Reflect.metadata("design:paramtypes", [void 0]), _dec35 = (0, _common.Post)('device/generate-key'), _dec36 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard, _trialGuard.TrialGuard), _dec37 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec38 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec39 = Reflect.metadata("design:type", Function), _dec40 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec41 = (0, _common.Get)('devices'), _dec42 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard, _trialGuard.TrialGuard), _dec43 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec44 = Reflect.metadata("design:type", Function), _dec45 = Reflect.metadata("design:paramtypes", [void 0]), _dec46 = (0, _common.Get)('tags'), _dec47 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard, _trialGuard.TrialGuard), _dec48 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec49 = Reflect.metadata("design:type", Function), _dec50 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = (_class2 = class RfidController {
  constructor(rfidService) {
    this.rfidService = rfidService;
  }
  async scan(apiKey, scanData) {
    console.log('[RFID] Scan received:', scanData);
    return this.rfidService.processScan(apiKey, scanData);
  }
  async getLatestScan(req) {
    return this.rfidService.getLatestScan(req.user.id);
  }
  async clearScanCache(req) {
    await this.rfidService.clearScanCache(req.user.id);
    return {
      success: true
    };
  }
  async setAssociationMode(req, body) {
    await this.rfidService.setAssociationMode(req.user.id, body.active);
    return {
      success: true
    };
  }
  async associateTag(req, tagId, body) {
    const {
      itemId,
      forceOverride = false
    } = body;
    return this.rfidService.associateTag(req.user.id, tagId, itemId, forceOverride);
  }
  async heartbeat(apiKey) {
    return this.rfidService.heartbeat(apiKey);
  }
  async generateKey(req, body) {
    return this.rfidService.generateApiKey(req.user.id, body.deviceName);
  }
  async getDevices(req) {
    return this.rfidService.getDeviceStatus(req.user.id);
  }
  async getTags(req) {
    return this.rfidService.getTags(req.user.id);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "scan", [_dec5, _dec6, _dec7, _dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "scan"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getLatestScan", [_dec0, _dec1, _dec10, _dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getLatestScan"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "clearScanCache", [_dec13, _dec14, _dec15, _dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "clearScanCache"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "setAssociationMode", [_dec18, _dec19, _dec20, _dec21, _dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "setAssociationMode"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "associateTag", [_dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "associateTag"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "heartbeat", [_dec31, _dec32, _dec33, _dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "heartbeat"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "generateKey", [_dec35, _dec36, _dec37, _dec38, _dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "generateKey"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getDevices", [_dec41, _dec42, _dec43, _dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "getDevices"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getTags", [_dec46, _dec47, _dec48, _dec49, _dec50], Object.getOwnPropertyDescriptor(_class2.prototype, "getTags"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class);