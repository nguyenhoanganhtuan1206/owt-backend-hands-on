import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../../integrations/mail/mail.module';
import { UserModule } from '../user/user.module';
import { AdminWfhRequestController } from '../wfh-request/controllers/admin-wfh-request.controller';
import { WfhRequestController } from '../wfh-request/controllers/wfh-request.controller';
import { WfhRequestEntity } from '../wfh-request/entities/wfh-request.entity';
import WfhRequestMapper from '../wfh-request/mapper/wfh-request.mapper';
import { WfhRequestService } from '../wfh-request/services/wfh-request.service';
import WfhRequestValidator from './validators/wfh-request.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([WfhRequestEntity]),
    MailModule,
    UserModule,
  ],
  controllers: [WfhRequestController, AdminWfhRequestController],
  exports: [WfhRequestService],
  providers: [WfhRequestService, WfhRequestValidator, WfhRequestMapper],
})
export class WfhRequestModule {}
