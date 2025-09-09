"use strict";

exports.__esModule = true;
exports.ItemLimitGuard = void 0;
var _common = require("@nestjs/common");
var _userService = require("../../user/user.service.js");
var _dec, _dec2, _dec3, _dec4, _class;
let ItemLimitGuard = exports.ItemLimitGuard = (_dec = (0, _common.Injectable)(), _dec2 = (0, _common.Dependencies)(_userService.UserService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class ItemLimitGuard {
  constructor(userService) {
    this.userService = userService;
  }
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    const userId = user.id;
    const fullUser = await this.userService.findOneById(userId);
    if (!fullUser) return false;
    if (fullUser.subscriptionTier !== 'trial') {
      return true;
    }
    if (fullUser.trialExpires && new Date() > new Date(fullUser.trialExpires)) {
      throw new _common.ForbiddenException({
        message: 'Trial expired.',
        code: 'TRIAL_EXPIRED'
      });
    }
    const itemsUsed = fullUser.trialItemsUsed || 0;
    if (itemsUsed >= 3) {
      throw new _common.ForbiddenException({
        message: `Trial limit reached. You can only add 3 items during your trial.`,
        code: 'TRIAL_LIMIT_ITEMS',
        limit: 3,
        used: itemsUsed
      });
    }
    request.trialUser = fullUser;
    request.trialLimits = {
      maxItems: 3,
      maxOutfits: 1,
      itemsUsed: itemsUsed,
      outfitsUsed: fullUser.trialOutfitsUsed || 0
    };
    return true;
  }
}) || _class) || _class) || _class) || _class);