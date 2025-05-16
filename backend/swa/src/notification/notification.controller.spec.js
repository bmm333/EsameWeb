import { Test } from '@nestjs/testing';
import { NotificationController } from './notification.controller';

describe('Notification Controller', () => {
  let controller;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
    }).compile();

    controller = module.get(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
