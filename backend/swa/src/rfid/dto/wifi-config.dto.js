import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WiFiConfigDto {
    @IsString()
    @IsNotEmpty()
    ssid; // WiFi network name

    @IsString()
    @IsNotEmpty()
    password; // WiFi password

    @IsOptional()
    @IsString()
    security; // 'WPA2', 'WPA3', etc.

    @IsOptional()
    @IsString()
    apiKey; // Device API key

    constructor(data = {}) {
        Object.assign(this, data);
    }
}