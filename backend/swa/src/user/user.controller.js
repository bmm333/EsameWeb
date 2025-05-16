import { Controller } from '@nestjs/common';
const UserService=require('./user.service');

@Controller('user')
export class UserController {
    constructor(userService)
    {
        this.userService=userService;
    }
    @Get(':id')
    async findOne(@Parm('id')id)
    {
        return this.userService.findOneById(praseInt(id,10));
    }
}
