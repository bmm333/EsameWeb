import { Test } from '@nestjs/testing';
import { RfidService } from './rfid.service';

describe('RfidService', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RfidService],
    }).compile();

    service = module.get(RfidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
