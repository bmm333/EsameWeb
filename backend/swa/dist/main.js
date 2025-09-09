"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
require("reflect-metadata");
require("dotenv/config");
var _core = require("@nestjs/core");
var _common = require("@nestjs/common");
var _app = require("./app.module");
var _transform = require("./transform.interceptor");
var _express = _interopRequireDefault(require("express"));
async function bootstrap() {
  const app = await _core.NestFactory.create(_app.AppModule, {
    bodyParser: {
      limit: '10mb'
    }
  });
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'https://swa-flex.vercel.app'],
    credentials: false
  });
  app.use(_express.default.json({
    limit: '10mb'
  }));
  app.use(_express.default.urlencoded({
    limit: '10mb',
    extended: true
  }));
  app.useGlobalPipes(new _common.ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.useGlobalInterceptors(new _transform.TransformInterceptor());
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://0.0.0.0:${port}`);
}
bootstrap();