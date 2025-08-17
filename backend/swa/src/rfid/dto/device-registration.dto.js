import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class DeviceRegistrationDto {
  @IsString()
  @IsNotEmpty()
  serialNumber;

  @IsString()
  @IsOptional()
  deviceName;

  @IsString()
  @IsOptional()
  firmwareVersion;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}
