import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RfidAccessGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.subscriptionTier === 'trial') {
      throw new ForbiddenException({
        message: 'RFID device setup is not available during trial. Please upgrade to access this feature.',
        code: 'TRIAL_FEATURE_RESTRICTED',
        feature: 'rfid_setup',
      });
    }

    return true;
  }
}