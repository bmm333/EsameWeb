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
var _mailing = require("./mailing/mailing.module");
var _settings = require("./settings/settings.module");
var _media = require("./media/media.module");
var _dashboard = require("./dashboard/dashboard.module");
var _analytics = require("./analytics/analytics.module");
var _weather = require("./weather/weather.module");
var _userEntity = require("./user/entities/user.entity.js");
var _userStylePreferencesEntity = require("./user/entities/user-style-preferences.entity.js");
var _userColorPreferencesEntity = require("./user/entities/user-color-preferences.entity.js");
var _userLifestyleEntity = require("./user/entities/user-lifestyle.entity.js");
var _userOccasionEntity = require("./user/entities/user-occasion.entity.js");
var _itemEntity = require("./item/entities/item.entity.js");
var _outfit2 = require("./outfit/entities/outfit.entity");
var _rfidDevice = require("./rfid/entities/rfid-device.entity");
var _rfidTagEntity = require("./rfid/entities/rfid-tag.entity.js");
var _mediaEntity = require("./media/entities/media.entity.js");
var _recommendation = require("./recommendation/entities/recommendation.entity");
var _dec, _class;
let AppModule = exports.AppModule = (_dec = (0, _common.Module)({
  imports: [_typeorm.TypeOrmModule.forRoot({
    type: "postgres",
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'swadb',
    entities: [_userEntity.User, _userStylePreferencesEntity.UserStylePreference, _userColorPreferencesEntity.UserColorPreference, _userLifestyleEntity.UserLifestyle, _userOccasionEntity.UserOccasion, _itemEntity.Item, _outfit2.Outfit, _rfidDevice.RfidDevice, _rfidTagEntity.RfidTag, _mediaEntity.Media, _recommendation.Recommendation],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  }), _user.UserModule, _auth.AuthModule, _item.ItemModule, _outfit.OutfitModule, _rfid.RfidModule, _mailing.MailingModule, _settings.SettingsModule, _media.MediaModule, _dashboard.DashboardModule, _analytics.AnalyticsModule, _weather.WeatherModule],
  controllers: [_app.AppController],
  providers: [_app2.AppService]
}), _dec(_class = class AppModule {
  configure(consumer) {
    consumer.apply(_logger.LoggerMiddleware, _validation.ValidationMiddleware).forRoutes('user');
  }
}) || _class);