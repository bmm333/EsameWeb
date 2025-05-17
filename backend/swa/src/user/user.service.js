import {Injectable} from '@nestjs/common';


@Injectable()
export class UserService{
    users=[];
    constructor(){}
    findOneById(id)
    {
        return {id,name:'User'+id};
    }
    create(user) {
        this.users.push(user);
        return this.users;
    }
}