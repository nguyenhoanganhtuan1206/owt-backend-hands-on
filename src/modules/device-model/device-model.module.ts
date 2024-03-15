import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceModule } from '../device/device.module';
import { DeviceOwnerModule } from '../device-owner/device-owner.module';
import { DeviceTypeModule } from '../device-type/device-type.module';
import { AdminDeviceModelController } from './controllers/admin-model.controller';
import { DeviceModelEntity } from './entities/device-model.entity';
import DeviceModelMapper from './mappers/device-model.mapper';
import { DeviceModelService } from './services/device-model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceModelEntity]),
    DeviceTypeModule,
    DeviceOwnerModule,
    forwardRef(() => DeviceModule),
  ],
  controllers: [AdminDeviceModelController],
  exports: [DeviceModelService, DeviceModelMapper],
  providers: [DeviceModelService, DeviceModelMapper],
})
export class DeviceModelModule {}
