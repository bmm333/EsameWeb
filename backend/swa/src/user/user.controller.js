import { Controller, Get, Param, Bind, Inject,Dependencies } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
@Dependencies(UserService)
export class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  @Get()
  findAll()
  {
    return 'this returns all users';
  }
  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return this.userService.findOneById(parseInt(id, 10));
  }
}
