import { Test } from '@nestjs/testing';
import { OutfitController } from './outfit.controller';

describe('Outfit Controller', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OutfitController],
    }).compile();

    controller = module.get(OutfitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
