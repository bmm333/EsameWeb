import { Test } from '@nestjs/testing';
import { ItemService } from './item.service';

describe('ItemService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ItemService],
    }).compile();

    service = module.get(ItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
