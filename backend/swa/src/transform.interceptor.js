// transform.interceptor.js
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransformInterceptor {
  intercept(context, next) {
    try {
      const request = context.switchToHttp().getRequest();
      const controllerName = context.getClass().name;
      
      // Debug logging
      console.log('Controller:', controllerName);
      console.log('Method:', request.method);
      console.log('Original Body:', request.body);
      
      // Determine the DTO class based on the controller and route
      let DtoClass = null;
      if (controllerName === 'UserController' && request.method === 'POST') {
        const { CreateUserDTO } = require('./user/dto/create-user.dto');
        DtoClass = CreateUserDTO;
      }
      
      // Transform the request body if a DTO class was found
      if (DtoClass) {
        request.body = plainToInstance(DtoClass, request.body);
        console.log('Transformed Body:', request.body);
      }
      
      return next.handle();
    } catch (error) {
      console.error('Error in TransformInterceptor:', error);
      return next.handle();
    }
  }
}