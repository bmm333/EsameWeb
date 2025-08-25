import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsArray } from 'class-validator';

export class TagDetectionDto {
    @IsString()
    @IsNotEmpty()
    tagId;

    @IsIn(['detected', 'removed'])
    event;

    @IsOptional()
    signalStrength; 

    @IsOptional()
    timestamp;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}