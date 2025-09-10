import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller.js';
import { SettingService } from './settings.service.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MailingModule } from '../mailing/mailing.module.js';

@Module({
  imports: [UserModule, AuthModule, MailingModule],
  controllers: [SettingsController],
  providers: [SettingService],
  exports: [SettingService]
})
export class SettingsModule {}