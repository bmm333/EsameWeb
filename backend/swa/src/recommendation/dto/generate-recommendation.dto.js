import { IsOptional, IsString, IsIn, IsObject } from 'class-validator';

export class GenerateRecommendationDto {
    @IsOptional()
    @IsIn(['work', 'casual', 'formal', 'sport', 'any'], { message: 'Invalid occasion' })
    occasion;

    @IsOptional()
    @IsIn(['manual', 'scheduled', 'rfid-triggered', 'weather-based'], { message: 'Invalid type' })
    type;

    @IsOptional()
    @IsObject({ message: 'Weather data must be an object' })
    weatherData;

    @IsOptional()
    @IsString({ message: 'Base item ID must be a string' })
    baseItemId; // For RFID-triggered recommendations

    @IsOptional()
    @IsObject({ message: 'Filters must be an object' })
    filters; // Additional filters (style, color preference, etc.)
}