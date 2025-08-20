import { IsNotEmpty, IsEnum } from 'class-validator';

export class LocationUpdateDto {
    @IsNotEmpty({ message: 'Location is required' })
    @IsEnum(['wardrobe', 'closet', 'laundry', 'worn', 'missing'], {
        message: 'Location must be one of: wardrobe, closet, laundry, worn, missing'
    })
    location;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}