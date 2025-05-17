import {Injectable} from '@nestjs/common';


@Injectable()
export class UserService{
    findOneById(id)
    {
        return {id,name:'User'+id};
    }
}