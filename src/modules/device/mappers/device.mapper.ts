import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import DeviceModelMapper from '../../device-model/mappers/device-model.mapper';
import DeviceOwnerMapper from '../../device-owner/mappers/device-owner.mapper';
import DeviceTypeMapper from '../../device-type/mappers/device-type.mapper';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateDeviceDto } from '../dtos/create-device.dto';
import type { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceEntity } from '../entities/device.entity';

@Injectable()
export default class DeviceMapper {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly deviceModelMapper: DeviceModelMapper,
    private readonly deviceTypeMapper: DeviceTypeMapper,
    private readonly deviceOwnerMapper: DeviceOwnerMapper,
    private readonly userMapper: UserMapper,
  ) {}

  async toDeviceEntityFromId(deviceId: number): Promise<DeviceEntity> {
    const deviceEntity = await this.deviceRepository.findOneBy({
      id: deviceId,
    });

    if (!deviceEntity) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_NOT_FOUND);
    }

    return deviceEntity;
  }

  async toDeviceEntity(
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceEntity> {
    const deviceEntity = plainToInstance(DeviceEntity, createDeviceDto);

    deviceEntity.type = await this.deviceTypeMapper.toDeviceTypeEntityFromId(
      createDeviceDto.typeId,
    );
    deviceEntity.model = await this.deviceModelMapper.toDeviceModelEntityFromId(
      createDeviceDto.modelId,
    );

    if (createDeviceDto.assigneeId) {
      deviceEntity.user = await this.userMapper.toUserEntityFromId(
        createDeviceDto.assigneeId,
      );
    }

    if (createDeviceDto.ownerId) {
      deviceEntity.owner =
        await this.deviceOwnerMapper.toDeviceOwnerEntityFromId(
          createDeviceDto.ownerId,
        );
    }

    return deviceEntity;
  }

  async toDeviceEntityToUpdate(
    deviceEntity: DeviceEntity,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceEntity> {
    const editableFields: Array<keyof UpdateDeviceDto> = [
      'serialNumber',
      'detail',
      'note',
      'status',
      'code',
      'purchasedAt',
    ];

    for (const field of editableFields) {
      deviceEntity[field] = updateDeviceDto[field];
    }

    if (updateDeviceDto.assigneeId) {
      deviceEntity.user = await this.userMapper.toUserEntityFromId(
        updateDeviceDto.assigneeId,
      );
    } else {
      deviceEntity.user = null;
    }

    if (updateDeviceDto.ownerId) {
      deviceEntity.owner =
        await this.deviceOwnerMapper.toDeviceOwnerEntityFromId(
          updateDeviceDto.ownerId,
        );
    } else {
      deviceEntity.owner = null;
    }

    deviceEntity.type = await this.deviceTypeMapper.toDeviceTypeEntityFromId(
      updateDeviceDto.typeId,
    );
    deviceEntity.model = await this.deviceModelMapper.toDeviceModelEntityFromId(
      updateDeviceDto.modelId,
    );

    return deviceEntity;
  }
}
