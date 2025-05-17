import { Controller, Get, Param, Bind } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(userService) {}

  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    return this.userService.findOneById(parseInt(id, 10));
  }
}
