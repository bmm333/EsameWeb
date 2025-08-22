import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateOutfitDto {
    @IsNotEmpty({ message: 'Outfit name is required' })
    @IsString({ message: 'Name must be a string' })
    name;

    @IsArray({ message: 'Items must be an array' })
    @IsNotEmpty({ message: 'At least one item is required' })
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