"use strict";

exports.__esModule = true;
exports.TrialGuard = void 0;
var _common = require("@nestjs/common");
var _userService = require("../../user/user.service.js");
var _dec, _dec2, _dec3, _dec4, _class;
let TrialGuard = exports.TrialGuard = (_dec = (0, _common.Injectable)(), _dec2 = (0, _common.Dependencies)(_userService.UserService), _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [void 0]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class TrialGuard {
  constructor(userService) {
    this.userService = userService;
  }
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId || request.user?.sub;
    if (!userId) return false;
    const user = await this.userService.findOneById(userId);
    if (!user) return false;
    if (user.subscriptionTier === 'free') {
      return true;
    }
    const path = request.route?.path || request.url;
    if (user.subscriptionTier === 'trial' && path && path.includes('/rfid')) {
      throw new _common.ForbiddenException({
        message: 'Device setup not available during trial. Upgrade to access RFID features.',
        code: 'TRIAL_BLOCKED'
      });
    }
    if (user.subscriptionTier === 'trial') {
      if (user.trialExpires && new Date() > user.trialExpires) {
        throw new _common.ForbiddenException({
          message: 'Trial expired. Please upgrade to continue.',
          code: 'TRIAL_EXPIRED'
        });
      }
      request.trialUser = user;
      request.trialLimits = {
        maxItems: 3,
        maxOutfits: 1,
        itemsUsed: user.trialItemsUsed || 0,
        outfitsUsed: user.trialOutfitsUsed
      };
      return true;
    }
    return false;
  }
}) || _class) || _class) || _class) || _class);