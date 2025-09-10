"use strict";

exports.__esModule = true;
exports.AppModule = void 0;
var _common = require("@nestjs/common");
var _typeorm = require("@nestjs/typeorm");
var _app = require("./app.controller");
var _app2 = require("./app.service");
var _auth = require("./auth/auth.module");
var _item = require("./item/item.module");
var _outfit = require("./outfit/outfit.module");
var _rfid = require("./rfid/rfid.module");
var _user = require("./user/user.module");
var _validation = require("./common/middleware/validation.middleware");
var _logger = require("./common/middleware/logger.middleware");
var _databaseConfig = require("../database.config.js");
var _mailing = require("./mailing/mailing.module");
var _settings = require("./settings/settings.module");
var _media = require("./media/media.module");
var _dashboard = require("./dashboard/dashboard.module");
var _analytics = require("./analytics/analytics.module");
var _weather = require("./weather/weather.module");
var _dec, _class;
let AppModule = exports.AppModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forRoot(_databaseConfig.dataSourceOptions), _user.UserModule, _auth.AuthModule, _item.ItemModule, _outfit.OutfitModule, _rfid.RfidModule, _mailing.MailingModule, _settings.SettingsModule, _media.MediaModule, _dashboard.DashboardModule, _analytics.AnalyticsModule, _weather.WeatherModule],
  controllers: [_app.AppController],
  providers: [_app2.AppService]
}), _dec(_class = class AppModule {
  configure(consumer) {
    consumer.apply(_logger.LoggerMiddleware, _validation.ValidationMiddleware).forRoutes('user');
  }
}) || _class);