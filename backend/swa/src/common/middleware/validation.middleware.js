import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateUserDTO } from '../../user/dto/create-user.dto';

@Injectable()
export class ValidationMiddleware {
  async use(req, res, next) {
    if (req.method === 'POST' && req.path === '/user') {
      console.log('ValidationMiddleware - Original request body:', req.body);
      const dto = new CreateUserDTO(req.body);
      const errors = await validate(dto, {
        skipMissingProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true
      });
      if (errors.length > 0) {
        console.log('[ValidationMiddleware] Validation errors:', JSON.stringify(errors, null, 2));
        const formattedErrors = errors.map(err => ({
          property: err.property,
          constraints: err.constraints
        }));
        return res.status(400).json({
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      req.body = dto;
      console.log('ValidationMiddleware - Modified request body:', req.body);
    }
    next();
  }
}