import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { Order } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { CreateDeviceOwnerDto } from '../dtos/create-device-owner.dto';
import type { DeviceOwnerDto } from '../dtos/device-owner.dto';
import { UpdateDeviceOwnerDto } from '../dtos/update-device-owner.dto';
import { DeviceOwnerEntity } from '../entities/device-owner.entity';
import DeviceOwnerMapper from '../mappers/device-owner.mapper';

@Injectable()
export class DeviceOwnerService {
  constructor(
    @InjectRepository(DeviceOwnerEntity)
    private readonly deviceOwnerRepository: Repository<DeviceOwnerEntity>,
    private readonly deviceOwnerMapper: DeviceOwnerMapper,
  ) {}

  async getAllDeviceOwners(): Promise<DeviceOwnerDto[]> {
    const deviceOwners = await this.deviceOwnerRepository.find({
      order: {
        name: Order.ASC,
      },
    });

    return deviceOwners.toDtos();
  }

  @Transactional()
  async createDeviceOwner(
    createDeviceOwnerDto: CreateDeviceOwnerDto,
  ): Promise<DeviceOwnerDto> {
    await this.verifyDeviceOwnerBeforeCreate(createDeviceOwnerDto);

    const deviceOwnerEntity =
      this.deviceOwnerMapper.toDeviceOwnerEntity(createDeviceOwnerDto);
    const deviceOwner =
      await this.deviceOwnerRepository.save(deviceOwnerEntity);

    return deviceOwner.toDto();
  }

  @Transactional()
  async updateDeviceOwner(
    ownerId: number,
    updateDeviceOwnerDto: UpdateDeviceOwnerDto,
  ): Promise<DeviceOwnerDto> {
    await this.verifyDeviceOwnerBeforeUpdate(ownerId, updateDeviceOwnerDto);

    const currentOwner =
      await this.deviceOwnerMapper.toDeviceOwnerEntityFromId(ownerId);

    currentOwner.name = updateDeviceOwnerDto.name;

    const updatedOwner = await this.deviceOwnerRepository.save(currentOwner);

    return updatedOwner.toDto();
  }

  @Transactional()
  async deleteDeviceOwner(ownerId: number): Promise<void> {
    await this.hasAssignedDevicesUnderOwner(ownerId);

    const deviceOwnerEntity =
      await this.deviceOwnerMapper.toDeviceOwnerEntityFromId(ownerId);

    await this.deviceOwnerRepository.remove(deviceOwnerEntity);
  }

  private async hasAssignedDevicesUnderOwner(ownerId: number): Promise<void> {
    const deviceCount = await this.deviceOwnerRepository
      .createQueryBuilder('deviceOwner')
      .leftJoin('deviceOwner.devices', 'devices')
      .where('devices.owner_id = :ownerId', { ownerId })
      .getCount();

    if (deviceCount > 0) {
      throw new InvalidBadRequestException(ErrorCode.OWNER_CAN_NOT_BE_DELETE);
    }
  }

  private async verifyDeviceOwnerBeforeCreate(
    createDeviceOwner: CreateDeviceOwnerDto,
  ) {
    const existingDeviceOwnerWithName = await this.deviceOwnerRepository
      .createQueryBuilder('deviceOwner')
      .where('LOWER(deviceOwner.name) = LOWER(:ownerName)', {
        ownerName: createDeviceOwner.name,
      })
      .getOne();

    if (existingDeviceOwnerWithName) {
      throw new InvalidBadRequestException(ErrorCode.DEVICE_OWNER_IS_EXISTING);
    }
  }

  private async verifyDeviceOwnerBeforeUpdate(
    ownerId: number,
    updateDeviceOwner: UpdateDeviceOwnerDto,
  ) {
    const existingDeviceOwnerWithName = await this.deviceOwnerRepository
      .createQueryBuilder('deviceOwner')
      .where(
        'deviceOwner.id <> :deviceOwnerId AND LOWER(deviceOwner.name) = LOWER(:ownerName)',
        { deviceOwnerId: ownerId, ownerName: updateDeviceOwner.name },
      )
      .getOne();

    if (existingDeviceOwnerWithName) {
      throw new InvalidBadRequestException(ErrorCode.DEVICE_OWNER_IS_EXISTING);
    }
  }
}
