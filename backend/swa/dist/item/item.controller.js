"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.ItemController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _itemService = require("./item.service.js");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _trialGuard = require("../common/guard/trial.guard.js");
var _itemLimitGuard = require("../common/guard/item-limit.guard.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _class, _class2;
let ItemController = exports.ItemController = (_dec = (0, _common.Controller)('item'), _dec2 = (0, _common.Dependencies)(_itemService.ItemService), _dec3 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard, _trialGuard.TrialGuard), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0]), _dec6 = (0, _common.Post)(), _dec7 = (0, _common.UseGuards)(_itemLimitGuard.ItemLimitGuard), _dec8 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec9 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec0 = Reflect.metadata("design:type", Function), _dec1 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec10 = (0, _common.Get)(), _dec11 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec12 = function (target, key) {
  return (0, _common.Query)()(target, key, 1);
}, _dec13 = Reflect.metadata("design:type", Function), _dec14 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec15 = (0, _common.Get)(':id'), _dec16 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec17 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec18 = Reflect.metadata("design:type", Function), _dec19 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec20 = (0, _common.Put)(':id'), _dec21 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec22 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec23 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec24 = Reflect.metadata("design:type", Function), _dec25 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec26 = (0, _common.Delete)(':id'), _dec27 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec28 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec29 = Reflect.metadata("design:type", Function), _dec30 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec31 = (0, _common.Get)(':id/availability'), _dec32 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec33 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec34 = Reflect.metadata("design:type", Function), _dec35 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec36 = (0, _common.Put)(':id/favorite'), _dec37 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec38 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec39 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class ItemController {
  constructor(itemService) {
    this.itemService = itemService;
  }
  async create(req, body) {
    return this.itemService.create(req.user.id, body);
  }
  async findAll(req, query) {
    return this.itemService.findAll(req.user.id, query);
  }
  async findOne(req, id) {
    return this.itemService.findOne(req.user.id, +id);
  }
  async update(req, id, body) {
    return this.itemService.update(+id, req.user.id, body);
  }
  async remove(req, id) {
    return this.itemService.remove(req.user.id, +id);
  }
  async getAvailability(req, id) {
    return this.itemService.getItemAvailability(req.user.id, +id);
  }
  async toggleFavorite(req, id, body) {
    return this.itemService.toggleFavorite(req.user.id, +id, body.favorite);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "create", [_dec6, _dec7, _dec8, _dec9, _dec0, _dec1], Object.getOwnPropertyDescriptor(_class2.prototype, "create"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "findAll", [_dec10, _dec11, _dec12, _dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "findAll"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "findOne", [_dec15, _dec16, _dec17, _dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "findOne"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "update", [_dec20, _dec21, _dec22, _dec23, _dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "update"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "remove", [_dec26, _dec27, _dec28, _dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "remove"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getAvailability", [_dec31, _dec32, _dec33, _dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "getAvailability"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "toggleFavorite", [_dec36, _dec37, _dec38, _dec39, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "toggleFavorite"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);