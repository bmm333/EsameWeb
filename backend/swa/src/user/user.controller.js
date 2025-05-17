import { Controller, Get, Param, Bind, Inject,Dependencies,Post,Body,ValidationPipe,UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';

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
  
  @Post()
  @Bind(Body())
  create(createUserDTO) {
    // Let automatic validation happen
    const result = this.userService.create(createUserDTO);
    return result;
  }
}
