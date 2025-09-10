import 'reflect-metadata';
import { IsOptional, IsString, IsArray, IsEnum, IsBoolean, IsDateString, Matches, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';


export class UserProfileSetupDto {
  @IsOptional()
  @IsArray({ message: 'Style preferences must be an array' })
  @IsEnum(['casual', 'formal', 'business', 'sporty', 'trendy', 'classic'], {
    each: true,
    message: 'Invalid style preference'
  })
  stylePreferences;

  @IsOptional()
  @IsArray({ message: 'Color preferences must be an array' })
  @IsString({ each: true, message: 'Each color preference must be a string' })
  colorPreferences;


  @IsOptional()
  @IsArray()
  @IsEnum(['work', 'casual', 'formal-events', 'gym', 'travel'], {
    each: true,
    message: 'Invalid occasion'
  })
  occasions;


  @IsOptional()
  @IsString()
  baseLocation;

  
  @IsOptional()
  @IsString()
  profilePicture;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

