import { IsString, IsNotEmpty, IsArray, IsOptional, IsIn } from 'class-validator';

export class RfidRealtimeDto {
    @IsArray()
    @IsNotEmpty()
    detectedTags; // Array of tag objects

    @IsOptional()
    timestamp;

    constructor(data = {}) {
        Object.assign(this, data);
    }
}