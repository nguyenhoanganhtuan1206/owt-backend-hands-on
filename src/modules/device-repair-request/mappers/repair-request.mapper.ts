import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { RequestStatusType } from '../../../constants';
import { DeviceService } from '../../device/services/device.service';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateRepairRequestDto } from '../dtos/create-repair-request.dto';
import { RepairRequestEntity } from '../entities/repair-request.entity';

@Injectable()
export default class RepairRequestMapper {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly userMapper: UserMapper,
  ) {}

  async toRepairRequestEntity(
    userId: number,
    deviceId: number,
    createRepairRequestDto: CreateRepairRequestDto,
  ): Promise<RepairRequestEntity> {
    const repairRequestEntity = plainToInstance(
      RepairRequestEntity,
      createRepairRequestDto,
    );

    repairRequestEntity.device =
      await this.deviceService.findDeviceById(deviceId);
    repairRequestEntity.user = await this.userMapper.toUserEntityFromId(userId);
    repairRequestEntity.status = RequestStatusType.PENDING;

    return repairRequestEntity;
  }
}
