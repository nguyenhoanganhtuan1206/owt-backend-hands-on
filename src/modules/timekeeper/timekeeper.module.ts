import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminTimeTrackingController } from './controllers/admin-time-tracking.controller';
import { MyTimeTrackingController } from './controllers/my-time-tracking.controller';
import { TimeKeeperEntity } from './entities/timekeeper.entity';
import { TimeTrackingService } from './services/time-tracking.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeKeeperEntity])],
  controllers: [MyTimeTrackingController, AdminTimeTrackingController],
  exports: [TimeTrackingService],
  providers: [TimeTrackingService],
})
export class TimeKeeperModule {}
