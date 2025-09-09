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
    origin: ['http://192.168.1.7:8080', 'http://localhost:8080', 'http://localhost:3000', process.env.FRONTEND_URL || 'https://your-app.vercel.app'],
    credentials: true
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
  const port = process.env.PORT || 3001;
  // FIX: Correct host configuration
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '192.168.1.7';
  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}
bootstrap();