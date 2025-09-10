import 'reflect-metadata';
import { 
  IsString, 
  IsEmail, 
  MinLength, 
  IsDefined, 
  IsOptional, 
  IsBoolean, 
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsPhoneNumber,
  Matches
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @IsDefined({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @Transform(({ value }) => value?.trim())
  firstName;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => value?.trim() || '')
  lastName;

  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email;

  @IsDefined({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  })
  password;

  @IsOptional()
  @IsPhoneNumber('ZZ', { message: 'Invalid phone number format' })
  phoneNumber;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth;

  @IsOptional()
  @IsEnum(['male', 'female'])
  gender;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}