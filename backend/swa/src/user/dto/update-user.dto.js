import { IsOptional, IsString, IsEmail, IsBoolean, IsDateString } from 'class-validator';

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

  @IsOptional()
  @IsBoolean({ message: 'Trial must be a boolean value' })
  trial;

  @IsOptional()
  @IsDateString({}, { message: 'Trial expiration must be a valid date' })
  trialExpires;
  
  @IsOptional()
  @IsString({ message: 'Base location must be a string' })
  baseLocation;

  constructor(data = {}) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.trial = data.trial;
    this.trialExpires = data.trialExpires;
  }
}