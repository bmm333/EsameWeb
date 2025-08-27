import { Injectable, CanActivate, ExecutionContext, ForbiddenException,Dependencies } from '@nestjs/common';
import { UserService } from '../../user/user.service.js';

@Injectable()
@Dependencies(UserService)
export class TrialGuard {
  constructor(userService) {
    this.userService = userService;
  }

  async canActivate(context){
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId || request.user?.sub;
    if (!userId) return false;
    const user = await this.userService.findOneById(userId);
    if (!user) return false;
    if (!user.trial) return true;
    if (user.trialExpires && new Date() > user.trialExpires) {
      throw new ForbiddenException('Trial expired. Please upgrade to continue.');
    }
    //store for throttling;
    request.trialUser = user;
    return true;
  }
}