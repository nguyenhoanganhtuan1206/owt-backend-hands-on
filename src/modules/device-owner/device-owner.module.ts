import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModelModule } from '../device-model/device-model.module';
import { DeviceRepairHistoryModule } from '../device-repair-history/device-repair-history.module';
import { AdminDeviceOwnerController } from './controllers/admin-owner.controller';
import { DeviceOwnerEntity } from './entities/device-owner.entity';
import DeviceOwnerMapper from './mappers/device-owner.mapper';
import { DeviceOwnerService } from './services/device-owner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceOwnerEntity]),
    DeviceRepairHistoryModule,
    forwardRef(() => DeviceModelModule),
  ],
  controllers: [AdminDeviceOwnerController],
  exports: [DeviceOwnerService, DeviceOwnerMapper],
  providers: [DeviceOwnerService, DeviceOwnerMapper],
})
export class DeviceOwnerModule {}
