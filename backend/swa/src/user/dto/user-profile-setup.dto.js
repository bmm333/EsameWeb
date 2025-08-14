import 'reflect-metadata';
import { 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsBoolean, 
  IsObject,
  IsString,
  ValidateNested,
  IsTimeString
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class SizesDto {
  @IsOptional()
  @IsString()
  tops;

  @IsOptional()
  @IsString()
  bottoms;

  @IsOptional()
  @IsString()
  shoes;

  @IsOptional()
  @IsString()
  dress;
}

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
  @IsArray({ message: 'Favorite shops must be an array' })
  @IsString({ each: true, message: 'Each shop must be a string' })
  favoriteShops;

  @IsOptional()
  @ValidateNested()
  @Type(() => SizesDto)
  sizes;

  @IsOptional()
  @IsEnum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: 'Primary size must be one of: XS, S, M, L, XL, XXL'
  })
  primarySize;

  @IsOptional()
  @IsArray()
  @IsEnum(['work-from-home', 'office-worker', 'student', 'parent', 'traveler'], {
    each: true,
    message: 'Invalid lifestyle option'
  })
  lifestyle;

  @IsOptional()
  @IsArray()
  @IsEnum(['work', 'casual', 'formal-events', 'gym', 'travel'], {
    each: true,
    message: 'Invalid occasion'
  })
  occasions;

  @IsOptional()
  @IsEnum(['conservative', 'moderate', 'bold'], {
    message: 'Risk tolerance must be one of: conservative, moderate, bold'
  })
  riskTolerance;

  @IsOptional()
  @IsBoolean({ message: 'Sustainability focus must be a boolean' })
  sustainabilityFocus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidMaterials;

  @IsOptional()
  @IsString()
  location;

  @IsOptional()
  @IsEnum(['tropical', 'temperate', 'cold', 'arid'], {
    message: 'Climate must be one of: tropical, temperate, cold, arid'
  })
  climate;

  @IsOptional()
  @IsBoolean()
  enableRecommendations;

  @IsOptional()
  @IsBoolean()
  enableWeatherNotifications;

  @IsOptional()
  @IsBoolean()
  enableOutfitReminders;

  @IsOptional()
  @IsTimeString({}, { message: 'Morning notification time must be a valid time format (HH:mm)' })
  morningNotificationTime;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}