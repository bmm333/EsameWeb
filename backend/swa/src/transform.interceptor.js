import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor {
  intercept(context, next) {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;
    const body = request.body;
    console.log(`[HTTP] ${method} ${path}`);
    console.log('Controller:', context.getClass().name);
    console.log('Method:', context.getHandler().name);
    console.log('Original Body:', body);
    return next.handle().pipe(
        map(data => {
          console.log('Response data:', data);
          return data;
        }),
    );
  }
}