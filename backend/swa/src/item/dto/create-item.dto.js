import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
    @IsNotEmpty({ message: 'RFID tag ID is required' })
    @IsString({ message: 'Tag ID must be a string' })
    tagId;

    @IsNotEmpty({ message: 'Item name is required' })
    @IsString({ message: 'Item name must be a string' })
    @MinLength(1, { message: 'Item name cannot be empty' })
    @MaxLength(100, { message: 'Item name cannot exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    name;

    @IsNotEmpty({ message: 'Item category is required' })
    @IsEnum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'], {
        message: 'Category must be one of: tops, bottoms, outerwear, shoes, accessories'
    })
    category;

    @IsOptional()
    @IsString({ message: 'Image URL must be a string' })
    imageUrl;

    @IsOptional()
    @IsEnum(['wardrobe', 'closet', 'laundry', 'worn', 'missing'], {
        message: 'Location must be one of: wardrobe, closet, laundry, worn, missing'
    })
    location;

    @IsOptional()
    @IsArray({ message: 'Tags must be an array' })
    @IsString({ each: true, message: 'Each tag must be a string' })
    tags;

    @IsOptional()
    @IsBoolean({ message: 'isFavorite must be a boolean' })
    isFavorite;

    @IsOptional()
    @IsString({ message: 'Color must be a string' })
    @MaxLength(50, { message: 'Color cannot exceed 50 characters' })
    color;

    @IsOptional()
    @IsString({ message: 'Brand must be a string' })
    @MaxLength(50, { message: 'Brand cannot exceed 50 characters' })
    brand;

    @IsOptional()
    @IsString({ message: 'Size must be a string' })
    @MaxLength(20, { message: 'Size cannot exceed 20 characters' })
    size;

    @IsOptional()
    @IsArray({ message: 'Season must be an array' })
    @IsEnum(['spring', 'summer', 'fall', 'winter', 'all'], {
        each: true,
        message: 'Each season must be one of: spring, summer, fall, winter, all'
    })
    season;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
    notes;

    @IsOptional()
    override;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}