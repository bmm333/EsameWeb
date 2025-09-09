"use strict";

exports.__esModule = true;
exports.ValidationMiddleware = void 0;
var _common = require("@nestjs/common");
var _classValidator = require("class-validator");
var _createUser = require("../../user/dto/create-user.dto");
var _dec, _class;
let ValidationMiddleware = exports.ValidationMiddleware = (_dec = (0, _common.Injectable)(), _dec(_class = class ValidationMiddleware {
  async use(req, res, next) {
    if (req.method === 'POST' && req.path === '/user') {
      console.log('ValidationMiddleware - Original request body:', req.body);
      const dto = new _createUser.CreateUserDTO(req.body);
      const errors = await (0, _classValidator.validate)(dto, {
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
}) || _class);