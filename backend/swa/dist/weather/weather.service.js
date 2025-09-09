"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.WeatherService = void 0;
var _index = _interopRequireDefault(require("../../node_modules/axios/index"));
var _common = require("@nestjs/common");
var _dec, _dec2, _dec3, _class;
let WeatherService = exports.WeatherService = (_dec = (0, _common.Injectable)(), _dec2 = Reflect.metadata("design:type", Function), _dec3 = Reflect.metadata("design:paramtypes", []), _dec(_class = _dec2(_class = _dec3(_class = class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    if (!this.apiKey) {
      console.warn('OPENWEATHER APO KEY not set - weather features are disabled');
    }
  }
  async getCurrentWeather(location) {
    if (!this.apiKey) {
      throw new BadRequestException('Weather service not configured');
    }
    try {
      const response = await _index.default.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      const weather = response.data;
      return {
        location: weather.name,
        country: weather.sys.country,
        temperature: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        condition: weather.weather[0].main,
        description: weather.weather[0].description,
        windSpeed: weather.wind?.speed || 0,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Weather API error:', error.response?.data || error.message);
      throw new BadRequestException(`Weather data unavailable for ${location}`);
    }
  }
  async getForecast(location, days = 3) {
    if (!this.apiKey) {
      throw new BadRequestException('Weather service not configured');
    }
    try {
      const response = await _index.default.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8
        }
      });
      const forecast = response.data;
      return {
        location: forecast.city.name,
        country: forecast.city.country,
        forecasts: forecast.list.map(item => ({
          datetime: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind?.speed || 0
        }))
      };
    } catch (error) {
      console.error('Forecast API error:', error.response?.data || error.message);
      throw new BadRequestException(`Forecast unavailable for ${location}`);
    }
  }
}) || _class) || _class) || _class);