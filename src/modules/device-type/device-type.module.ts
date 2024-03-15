import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceEntity } from '../device/entities/device.entity';
import { AdminDeviceTypeController } from '../device-type/controllers/admin-type.controller';
import { DeviceTypeEntity } from '../device-type/entities/device-type.entity';
import DeviceTypeMapper from '../device-type/mappers/device-type.mapper';
import { DeviceTypeService } from './services/device-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceTypeEntity, DeviceEntity])],
  controllers: [AdminDeviceTypeController],
  exports: [DeviceTypeService, DeviceTypeMapper],
  providers: [DeviceTypeService, DeviceTypeMapper],
})
export class DeviceTypeModule {}
