"use strict";

var _testing = require("@nestjs/testing");
var _app = require("./app.controller");
var _app2 = require("./app.service");
describe('AppController', () => {
  let app;
  beforeAll(async () => {
    app = await _testing.Test.createTestingModule({
      controllers: [_app.AppController],
      providers: [_app2.AppService]
    }).compile();
  });
  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get(_app.AppController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});