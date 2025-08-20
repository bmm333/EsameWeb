import { IsString, IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto.js';

export class ItemAssociateDto {
    @IsNotEmpty({ message: 'RFID tag ID is required' })
    @IsString({ message: 'Tag ID must be a string' })
    tagId;

    @ValidateNested()
    @Type(() => CreateItemDto)
    itemData;

    @IsOptional()
    @IsBoolean({ message: 'Override must be a boolean' })
    override;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}