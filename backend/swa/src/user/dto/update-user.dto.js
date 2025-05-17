import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDTO{
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName;
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName;
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email;
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  password;
  constructor(data = {}) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
  }
}