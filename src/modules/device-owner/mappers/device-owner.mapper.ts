import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import type { CreateDeviceOwnerDto } from '../dtos/create-device-owner.dto';
import { DeviceOwnerEntity } from '../entities/device-owner.entity';

@Injectable()
export default class DeviceOwnerMapper {
  constructor(
    @InjectRepository(DeviceOwnerEntity)
    private readonly deviceOwnerRepository: Repository<DeviceOwnerEntity>,
  ) {}

  async toDeviceOwnerEntityFromId(ownerId: number): Promise<DeviceOwnerEntity> {
    const deviceOwnerEntity = await this.deviceOwnerRepository.findOneBy({
      id: ownerId,
    });

    if (!deviceOwnerEntity) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_OWNER_NOT_FOUND);
    }

    return deviceOwnerEntity;
  }

  toDeviceOwnerEntity(
    createDeviceOwnerDto: CreateDeviceOwnerDto,
  ): DeviceOwnerEntity {
    return plainToInstance(DeviceOwnerEntity, createDeviceOwnerDto);
  }
}
