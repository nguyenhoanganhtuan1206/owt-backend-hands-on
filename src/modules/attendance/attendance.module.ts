import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../../modules/user/user.module';
import { TimeOffRequestModule } from '../time-off-request/time-off-request.module';
import { UserEntity } from '../user/entities/user.entity';
import { WfhRequestModule } from '../wfh-request/wfh-request.module';
import { AdminAttendanceController } from './controllers/admin-attendance.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TimeOffRequestModule,
    WfhRequestModule,
    UserModule,
  ],
  controllers: [AttendanceController, AdminAttendanceController],
  exports: [AttendanceService],
  providers: [AttendanceService],
})
export class AttendanceModule {}
