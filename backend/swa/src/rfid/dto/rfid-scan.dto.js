import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';


export class RfidScanDto {
  @IsString()
  @IsNotEmpty()
  deviceSerial;

  @IsString()
  @IsNotEmpty()
  tagId;

  @IsEnum(['detected', 'removed'])
  event;

  @IsOptional()
  timestamp;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}