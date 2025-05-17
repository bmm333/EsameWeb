import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe,BadRequestException  } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CRITICAL: This enables validation throughout your application
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: false,
    forbidNonWhitelisted: false,
    skipMissingProperties: false,
    dismissDefaultMessages: false,
    validationError: { target: false, value: true },
    // This is critical - empty strings should be treated as invalid
    validateCustomDecorators: true,
    // Force all properties to be validated
    enableImplicitConversion: false, 
    // Custom function to determine if a property is empty
     exceptionFactory: (errors) => {
        console.log('Validation errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException({
          message: 'Validation failed',
          errors: errors
        });
      }
  })
);
  app.useGlobalInterceptors(new TransformInterceptor());

  
  await app.listen(3000);
}
bootstrap();