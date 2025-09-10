import { Injectable,Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware {
  constructor() {
    this.logger = new Logger('HTTP');
  }

  use(req, res, next) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}

