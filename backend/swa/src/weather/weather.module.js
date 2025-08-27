import {Module} from "@nestjs/common";
import {WeatherService} from "./weather.service.js";

@Module({
    imports: [],
    providers: [WeatherService],
    exports: [WeatherService]
})export class WeatherModule {}