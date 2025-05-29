import 'reflect-metadata';
import { IsString, IsEmail, MinLength, IsDefined, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateUserDTO {
  @IsDefined({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  firstName;

  @IsDefined({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  lastName;

  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email;

  @IsDefined({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password;

  @IsOptional()
  @IsBoolean({ message: 'Trial must be a boolean value' })
  trial;

  @IsOptional()
  @IsDateString({}, { message: 'Trial expiration must be a valid date' })
  trialExpires;

  constructor(data = {}) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.trial = data.trial !== undefined ? data.trial : true; //def to trial
    this.trialExpires = data.trialExpires;
  }
}