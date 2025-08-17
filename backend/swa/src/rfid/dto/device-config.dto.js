import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
export class DeviceConfigDto {
  @IsString()
  @IsNotEmpty()
  serialNumber;

  @IsOptional()
  wifiCredentials;

  @IsOptional()
  settings;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}