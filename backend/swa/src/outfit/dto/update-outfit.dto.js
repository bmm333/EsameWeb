import { IsOptional, IsString, IsArray, IsEnum, IsBoolean } from 'class-validator';

export class UpdateOutfitDto {
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name;

    @IsOptional()
    @IsArray({ message: 'Items must be an array' })
    items;

    @IsOptional()
    @IsEnum(['casual', 'formal', 'business', 'sporty', 'party', 'vacation'], {
        message: 'Invalid occasion type'
    })
    occasion;

    @IsOptional()
    @IsEnum(['spring', 'summer', 'fall', 'winter', 'all-season'], {
        message: 'Invalid season'
    })
    season;

    @IsOptional()
    @IsString()
    notes;

    @IsOptional()
    @IsBoolean()
    isFavorite;
}