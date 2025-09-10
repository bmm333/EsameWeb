import {Module} from "@nestjs/common";
import {WeatherService} from "./weather.service.js";
import {WeatherController} from "./weather.controller.js";
@Module({
    imports: [],
    providers: [WeatherService],
    exports: [WeatherService],
    controllers:[WeatherController]
})export class WeatherModule {}