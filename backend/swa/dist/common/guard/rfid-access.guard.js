"use strict";

exports.__esModule = true;
exports.RfidAccessGuard = void 0;
var _common = require("@nestjs/common");
var _dec, _class;
let RfidAccessGuard = exports.RfidAccessGuard = (_dec = (0, _common.Injectable)(), _dec(_class = class RfidAccessGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.subscriptionTier === 'trial') {
      throw new _common.ForbiddenException({
        message: 'RFID device setup is not available during trial. Please upgrade to access this feature.',
        code: 'TRIAL_FEATURE_RESTRICTED',
        feature: 'rfid_setup'
      });
    }
    return true;
  }
}) || _class);