import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Dependencies } from '@nestjs/common';
import { UserService } from '../../user/user.service.js';


@Injectable()
@Dependencies(UserService)
export class TrialGuard {
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
      throw new ForbiddenException({
        message: 'Device setup not available during trial. Upgrade to access RFID features.',
        code: 'TRIAL_BLOCKED',
      });
    }
    if (user.subscriptionTier === 'trial') {
      if (user.trialExpires && new Date() > user.trialExpires) {
        throw new ForbiddenException({
          message: 'Trial expired. Please upgrade to continue.',
          code: 'TRIAL_EXPIRED',
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
}