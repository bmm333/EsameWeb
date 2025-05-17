import {Injectable} from '@nestjs/common';


@Injectable()
export class UserService{
    constructor(){}
    findOneById(id)
    {
        return {id,name:'User'+id};
    }
}