import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import type { DeviceEntity } from '../../device/entities/device.entity';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import { RepairHistoryEntity } from '../entities/repair-history.entity';

@Injectable()
export default class RepairHistoryMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toRepairHistoryEntity(
    deviceEntity: DeviceEntity,
    createDeviceRepairHistory: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryEntity> {
    const repairHistoryEntity = plainToInstance(
      RepairHistoryEntity,
      createDeviceRepairHistory,
    );

    repairHistoryEntity.requestedBy = await this.userMapper.toUserEntityFromId(
      createDeviceRepairHistory.requestedBy,
    );
    repairHistoryEntity.device = deviceEntity;

    return repairHistoryEntity;
  }
}
