import { Test } from '@nestjs/testing';
import { OutfitService } from './outfit.service';

describe('OutfitService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OutfitService],
    }).compile();

    service = module.get(OutfitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
