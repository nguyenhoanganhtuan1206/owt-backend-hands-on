import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModule } from '../device/device.module';
import { AdminDeviceRepairHistoryController } from '../device-repair-history/controllers/admin-device-repair-history.controller';
import { RepairHistoryEntity } from '../device-repair-history/entities/repair-history.entity';
import { DeviceRepairRequestModule } from '../device-repair-request/device-repair-request.module';
import { UserModule } from '../user/user.module';
import RepairHistoryMapper from './mappers/repair-history.mapper';
import { RepairHistoryService } from './services/repair-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepairHistoryEntity]),
    DeviceRepairRequestModule,
    forwardRef(() => DeviceModule),
    UserModule,
  ],
  controllers: [AdminDeviceRepairHistoryController],
  exports: [RepairHistoryService],
  providers: [RepairHistoryService, RepairHistoryMapper],
})
export class DeviceRepairHistoryModule {}
