"use strict";

exports.__esModule = true;
exports.RecommendationModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _recommendationController = require("./recommendation.controller.js");
var _recommendationService = require("./recommendation.service.js");
var _recommendationEntity = require("./entities/recommendation.entity.js");
var _itemEntity = require("../item/entities/item.entity.js");
var _mailingModule = require("../mailing/mailing.module.js");
var _dec, _class;
let RecommendationModule = exports.RecommendationModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forFeature([_recommendationEntity.Recommendation, _itemEntity.Item]), _mailingModule.MailingModule],
  controllers: [_recommendationController.RecommendationController],
  providers: [_recommendationService.RecommendationService],
  exports: [_recommendationService.RecommendationService]
}), _dec(_class = class RecommendationModule {}) || _class);