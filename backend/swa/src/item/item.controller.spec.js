import { Test } from '@nestjs/testing';
import { ItemController } from './item.controller';

describe('Item Controller', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ItemController],
    }).compile();

    controller = module.get(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
