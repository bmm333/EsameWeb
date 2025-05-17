import 'reflect-metadata';
import { IsNotEmpty, IsString, IsEmail, MinLength ,IsDefined } from 'class-validator';

export class CreateUserDTO {
  firstName;
  lastName;
  email;
  password;
}


IsString()(CreateUserDTO.prototype, 'firstName');
IsDefined()(CreateUserDTO.prototype, 'firstName');
MinLength(1)(CreateUserDTO.prototype, 'firstName');

IsString()(CreateUserDTO.prototype, 'lastName');
IsDefined()(CreateUserDTO.prototype, 'lastName');
MinLength(1)(CreateUserDTO.prototype, 'lastName');

IsEmail()(CreateUserDTO.prototype, 'email');
IsDefined()(CreateUserDTO.prototype, 'email');
MinLength(1)(CreateUserDTO.prototype, 'email');

IsString()(CreateUserDTO.prototype, 'password');
IsDefined()(CreateUserDTO.prototype, 'password');
MinLength(1)(CreateUserDTO.prototype, 'password');