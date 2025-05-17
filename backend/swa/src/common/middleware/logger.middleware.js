import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware {
  use(req, res, next) {
    const { method, originalUrl } = req;
    const start = Date.now();
    Logger.log(`Incoming Request: ${method} ${originalUrl}`, 'LoggerMiddleware');
     res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      Logger.log(`Response: ${method} ${originalUrl} ${statusCode} - ${duration}ms`, 'LoggerMiddleware');
    });

    next();
  }
}

