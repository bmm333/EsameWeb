import { MailingService } from "./mailing.service";
import { Module } from '@nestjs/common';

@Module({
    providers:[MailingService],
    exports:[MailingService],
})
export class MailingModule{}