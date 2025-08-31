import {
  Controller,
  Dependencies,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weather')
@UseGuards(JwtAuthGuard)
@Dependencies(WeatherService)
export class WeatherController {
  constructor(weatherService) {
    this.weatherService = weatherService;
  }
  @Get('current')
  async currentWeather(@Query('location') location) {
    return this.weatherService.getCurrentWeather(location);
  }
}