"use strict";

exports.__esModule = true;
exports.TransformInterceptor = void 0;
var _common = require("@nestjs/common");
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _dec, _class;
let TransformInterceptor = exports.TransformInterceptor = (_dec = (0, _common.Injectable)(), _dec(_class = class TransformInterceptor {
  intercept(context, next) {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;
    const body = request.body;
    console.log(`[HTTP] ${method} ${path}`);
    console.log('Controller:', context.getClass().name);
    console.log('Method:', context.getHandler().name);
    console.log('Original Body:', body);
    return next.handle().pipe((0, _operators.map)(data => {
      console.log('Response data:', data);
      return data;
    }));
  }
}) || _class);