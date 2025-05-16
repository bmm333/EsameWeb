import { Test } from '@nestjs/testing';
import { RfidController } from './rfid.controller';

describe('Rfid Controller', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RfidController],
    }).compile();

    controller = module.get(RfidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
