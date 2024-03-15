import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../../integrations/mail/mail.module';
import { TimeOffCollaboratorModule } from '../../modules/time-off-collaborator/time-off-collaborator.module';
import { UserModule } from '../../modules/user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AdminTimeOffRequestController } from './controllers/admin-time-off-request.controller';
import { TimeOffRequestController } from './controllers/time-off-request.controller';
import { TimeOffRequestEntity } from './entities/time-off-request.entity';
import TimeOffRequestMapper from './mapper/time-off-request.mapper';
import { TimeOffRequestService } from './services/time-off-request.service';
import TimeOffRequestValidator from './validators/time-off-request.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeOffRequestEntity]),
    AuthModule,
    MailModule,
    UserModule,
    TimeOffCollaboratorModule,
  ],
  controllers: [TimeOffRequestController, AdminTimeOffRequestController],
  exports: [TimeOffRequestService, TimeOffRequestMapper],
  providers: [
    TimeOffRequestService,
    TimeOffRequestMapper,
    TimeOffRequestValidator,
  ],
})
export class TimeOffRequestModule {}
