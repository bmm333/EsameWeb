import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsIn } from 'class-validator';

export class CreateScheduleDto {
    @IsNotEmpty({ message: 'Schedule type is required' })
    @IsIn(['daily', 'weekly', 'event-based'], { message: 'Invalid schedule type' })
    type;

    @IsNotEmpty({ message: 'Schedule name is required' })
    @IsString({ message: 'Name must be a string' })
    name;

    @IsOptional()
    @IsString({ message: 'Time must be a string in HH:MM format' })
    time;

    @IsOptional()
    @IsArray({ message: 'Days of week must be an array' })
    daysOfWeek;

    @IsOptional()
    @IsIn(['work', 'casual', 'formal', 'sport', 'any'], { message: 'Invalid occasion' })
    occasion;

    @IsOptional()
    @IsBoolean({ message: 'Include weather check must be boolean' })
    includeWeatherCheck;

    @IsOptional()
    preferences;

    @IsOptional()
    @IsString({ message: 'Message must be a string' })
    message;
}