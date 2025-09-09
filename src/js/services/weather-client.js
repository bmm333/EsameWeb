export class WeatherClient {
    constructor(api) { this.api = api; }
    async getCurrent(location) {
        return this.api.get(`/weather/current?location=${encodeURIComponent(location)}`);
    }
}