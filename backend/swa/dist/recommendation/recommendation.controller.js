"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.RecommendationController = void 0;
var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));
var _common = require("@nestjs/common");
var _recommendationService = require("./recommendation.service.js");
var _jwtAuthGuard = require("../auth/guards/jwt-auth.guard.js");
var _mailingService = require("../mailing/mailing.service.js");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _class, _class2;
let RecommendationController = exports.RecommendationController = (_dec = (0, _common.Controller)('recommendation'), _dec2 = (0, _common.Dependencies)(_recommendationService.RecommendationService, _mailingService.MailingService), _dec3 = (0, _common.UseGuards)(_jwtAuthGuard.JwtAuthGuard), _dec4 = Reflect.metadata("design:type", Function), _dec5 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec6 = (0, _common.Get)(), _dec7 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec8 = function (target, key) {
  return (0, _common.Query)()(target, key, 1);
}, _dec9 = Reflect.metadata("design:type", Function), _dec0 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec1 = (0, _common.Post)('generate'), _dec10 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec11 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec12 = Reflect.metadata("design:type", Function), _dec13 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec14 = (0, _common.Get)('history'), _dec15 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec16 = Reflect.metadata("design:type", Function), _dec17 = Reflect.metadata("design:paramtypes", [void 0]), _dec18 = (0, _common.Put)(':id/reject'), _dec19 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec20 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec21 = function (target, key) {
  return (0, _common.Body)()(target, key, 2);
}, _dec22 = Reflect.metadata("design:type", Function), _dec23 = Reflect.metadata("design:paramtypes", [void 0, void 0, void 0]), _dec24 = (0, _common.Post)(), _dec25 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec26 = function (target, key) {
  return (0, _common.Body)()(target, key, 1);
}, _dec27 = Reflect.metadata("design:type", Function), _dec28 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec29 = (0, _common.Put)(':id/worn'), _dec30 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec31 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec32 = Reflect.metadata("design:type", Function), _dec33 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec34 = (0, _common.Delete)(':id'), _dec35 = function (target, key) {
  return (0, _common.Request)()(target, key, 0);
}, _dec36 = function (target, key) {
  return (0, _common.Param)('id')(target, key, 1);
}, _dec37 = Reflect.metadata("design:type", Function), _dec38 = Reflect.metadata("design:paramtypes", [void 0, void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = _dec5(_class = (_class2 = class RecommendationController {
  constructor(recommendationService, mailingService) {
    this.recommendationService = recommendationService;
    this.mailingService = mailingService;
  }
  async getRecommendations(req, query) {
    return this.recommendationService.getRecommendations(req.user.id, query);
  }
  async generateRecommendations(req, body) {
    const userId = req.user.id;
    const recommendations = await this.recommendationService.generateRecommendations(userId, body);
    try {
      await this.mailingService.sendRecommendationNotification(req.user, recommendations);
      console.log('Recommendation email sent to:', req.user.email);
    } catch (emailError) {
      console.error('Failed to send recommendation email:', emailError);
    }
    return recommendations;
  }
  async getHistory(req) {
    return this.recommendationService.getRecommendationHistory(req.user.id);
  }
  async rejectRecommendation(req, id, body) {
    const userId = req.user.id;
    const {
      reason
    } = body;
    return await this.recommendationService.rejectRecommendation(userId, id, reason);
  }
  async saveRecommendation(req, body) {
    return this.recommendationService.saveRecommendation(req.user.id, body);
  }
  async markAsWorn(req, id) {
    return this.recommendationService.markAsWorn(req.user.id, +id);
  }
  async deleteRecommendation(req, id) {
    return this.recommendationService.deleteRecommendation(req.user.id, +id);
  }
}, (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getRecommendations", [_dec6, _dec7, _dec8, _dec9, _dec0], Object.getOwnPropertyDescriptor(_class2.prototype, "getRecommendations"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "generateRecommendations", [_dec1, _dec10, _dec11, _dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "generateRecommendations"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "getHistory", [_dec14, _dec15, _dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "getHistory"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "rejectRecommendation", [_dec18, _dec19, _dec20, _dec21, _dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "rejectRecommendation"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "saveRecommendation", [_dec24, _dec25, _dec26, _dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "saveRecommendation"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "markAsWorn", [_dec29, _dec30, _dec31, _dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "markAsWorn"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "deleteRecommendation", [_dec34, _dec35, _dec36, _dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteRecommendation"), _class2.prototype), _class2)) || _class) || _class) || _class) || _class) || _class);