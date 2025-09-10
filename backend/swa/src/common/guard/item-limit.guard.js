import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Dependencies } from '@nestjs/common';
import { UserService } from '../../user/user.service.js';

@Injectable()
@Dependencies(UserService)
export class ItemLimitGuard {
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
      throw new ForbiddenException({
        message: 'Trial expired.',
        code: 'TRIAL_EXPIRED',
      });
    }

    const itemsUsed = fullUser.trialItemsUsed || 0;
    if (itemsUsed >= 3) {
      throw new ForbiddenException({
        message: `Trial limit reached. You can only add 3 items during your trial.`,
        code: 'TRIAL_LIMIT_ITEMS',
        limit: 3,
        used: itemsUsed,
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
}