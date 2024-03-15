import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../../integrations/mail/mail.module';
import { DeviceModelModule } from '../../modules/device-model/device-model.module';
import { DeviceOwnerModule } from '../../modules/device-owner/device-owner.module';
import { DeviceTypeModule } from '../../modules/device-type/device-type.module';
import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import { UserModule } from '../user/user.module';
import { AdminDeviceController } from './controllers/admin-device.controller';
import { DeviceController } from './controllers/device.controller';
import { DeviceEntity } from './entities/device.entity';
import { DeviceAssigneeHistoryEntity } from './entities/device-assiginee-history.entity';
import DeviceMapper from './mappers/device.mapper';
import { DeviceService } from './services/device.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceEntity,
      DeviceAssigneeHistoryEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
    DeviceTypeModule,
    forwardRef(() => DeviceModelModule),
    DeviceOwnerModule,
    MailModule,
    UserModule,
  ],
  controllers: [AdminDeviceController, DeviceController],
  exports: [DeviceService],
  providers: [DeviceService, DeviceMapper, PositionMapper, LevelMapper],
})
export class DeviceModule {}
