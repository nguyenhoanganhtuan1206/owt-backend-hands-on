import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModule } from '../device/device.module';
import { UserModule } from '../user/user.module';
import { AdminDeviceRepairRequestController } from './controllers/admin-repair-request.controller';
import { DeviceRepairRequestController } from './controllers/repair-request.controller';
import { RepairRequestEntity } from './entities/repair-request.entity';
import RepairRequestMapper from './mappers/repair-request.mapper';
import { RepairRequestService } from './services/repair-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepairRequestEntity]),
    forwardRef(() => DeviceModule),
    UserModule,
  ],
  controllers: [
    AdminDeviceRepairRequestController,
    DeviceRepairRequestController,
  ],
  exports: [RepairRequestService, RepairRequestMapper],
  providers: [RepairRequestService, RepairRequestMapper],
})
export class DeviceRepairRequestModule {}
