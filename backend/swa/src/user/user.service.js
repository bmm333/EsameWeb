import { Injectable } from '@nestjs/common';
import User from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        userRepository,
    ){
        this.userRepository=userRepository;
    }
}
module.exports=UserService;