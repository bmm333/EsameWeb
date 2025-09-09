"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.OutfitController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _jwtAuth = require("../auth/guards/jwt-auth.guard");
var _outfit = require("./outfit.service");
var _user = require("../user/user.service");
var _trial = require("../common/guard/trial.guard");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _class, _class2;
let OutfitController = exports.OutfitController = (_dec = (0, _common.Controller)('outfit'), _dec2 = (0, _common.UseGuards)(_jwtAuth.JwtAuthGuard, _trial.TrialGuard), _dec3 = (0, _common.Dependencies)(_outfit.OutfitService, _user.UserService), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec6 = (0, _common.Post)(), _dec7 = function (target, key) {
  return (0, _common.Body)()(target, key, 0);
}, _dec8 = function (target, key) {
  return (0, _common.Req)()(target, key, 1);
}, _dec9 = Reflect.metadata("design:type", Function), _dec0 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec1 = (0, _common.Get)(), _dec10 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec11 = function (target, key) {
  return (0, _common.Query)()(target, key, 1);
}, _dec12 = Reflect.metadata("design:type", Function), _dec13 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec14 = (0, _common.Get)(':id'), _dec15 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec16 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec17 = Reflect.metadata("design:type", Function), _dec18 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec19 = (0, _common.Put)(':id'), _dec20 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec21 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec22 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec23 = Reflect.metadata("design:type", Function), _dec24 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec25 = (0, _common.Delete)(':id'), _dec26 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec27 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec28 = Reflect.metadata("design:type", Function), _dec29 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec30 = (0, _common.Patch)(':id/worn'), _dec31 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec32 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec33 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec34 = Reflect.metadata("design:type", Function), _dec35 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec36 = (0, _common.Patch)(':id/favorite'), _dec37 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec38 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec39 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec42 = (0, _common.Get)(':id/availability'), _dec43 = function (target, key) {
  return (0, _common.Req)()(target, key, 0);
}, _dec44 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec45 = Reflect.metadata("design:type", Function), _dec46 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class OutfitController {
  constructor(outfitService, userService) {
    this.outfitService = outfitService;
    this.userService = userService;
  }
  async create(createOutfitDto, req) {
    console.log('Creating outfit with data:', createOutfitDto);
    if (!createOutfitDto.name || !createOutfitDto.name.trim()) {
      throw new _common.BadRequestException('Outfit name is required');
    }
    if (!createOutfitDto.itemIds || !Array.isArray(createOutfitDto.itemIds) || createOutfitDto.itemIds.length === 0) {
      throw new _common.BadRequestException('At least one item is required');
    }
    const userId = req.user.id;
    if (req.trialUser && req.trialLimits && req.trialLimits.outfitsUsed >= req.trialLimits.maxOutfits) {
      throw new _common.ForbiddenException({
        message: 'Outfit limit reached for trial users. Upgrade to create more outfits.',
        code: 'TRIAL_LIMIT_EXCEEDED'
      });
    }
    const result = await this.outfitService.createOutfit(userId, createOutfitDto);
    if (req.trialUser) {
      await this.userService.updateUserRecord(userId, {
        trialOutfitsUsed: (req.trialLimits.outfitsUsed || 0) + 1
      });
    }
    return result;
  }
  async getAllOutfits(req, query) {
    const userId = req.user.id;
    const filters = {
      occasion: query.occasion,
      season: query.season,
      isFavorite: query.favorite === 'true' ? true : query.favorite === 'false' ? false : undefined,
      search: query.search
    };
    return await this.outfitService.getAllOutfits(userId, filters);
  }
  async getOutfitById(req, outfitId) {
    const userId = req.user.id;
    return await this.outfitService.getOutfitById(userId, outfitId);
  }
  async updateOutfit(req, outfitId, updateOutfitDto) {
    const userId = req.user.id;
    return await this.outfitService.updateOutfit(userId, outfitId, updateOutfitDto);
  }
  async deleteOutfit(req, outfitId) {
    const userId = req.user.id;
    return await this.outfitService.deleteOutfit(userId, outfitId);
  }
  async logWear(req, outfitId, body) {
    const userId = req.user.id;
    console.log('Marking outfit as worn:', outfitId, 'by user:', userId);
    return await this.outfitService.logWear(userId, outfitId);
  }
  async toggleFavorite(req, outfitId, body) {
    const userId = req.user.id;
    console.log('Toggling favorite for outfit:', outfitId, 'by user:', userId);
    return await this.outfitService.toggleFavorite(userId, outfitId);
  }
  async checkAvailability(req, outfitId) {
    const userId = req.user.id;
    const outfit = await this.outfitService.getOutfitById(userId, outfitId);
    return {
      outfitId,
      isAvailable: outfit.isAvailable,
      availableItems: outfit.availableItems,
      unavailableItems: outfit.unavailableItems
    };
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "create", [_dec6, _dec7, _dec8, _dec9, _dec0], Object.getOwnPropertyDescriptor(_class2.prototype, "create"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getAllOutfits", [_dec1, _dec10, _dec11, _dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getAllOutfits"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getOutfitById", [_dec14, _dec15, _dec16, _dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getOutfitById"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "updateOutfit", [_dec19, _dec20, _dec21, _dec22, _dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "updateOutfit"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deleteOutfit", [_dec25, _dec26, _dec27, _dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteOutfit"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "logWear", [_dec30, _dec31, _dec32, _dec33, _dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "logWear"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "toggleFavorite", [_dec36, _dec37, _dec38, _dec39, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "toggleFavorite"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "checkAvailability", [_dec42, _dec43, _dec44, _dec45, _dec46], Object.getOwnPropertyDescriptor(_class2.prototype, "checkAvailability"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);