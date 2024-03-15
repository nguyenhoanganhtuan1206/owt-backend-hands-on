import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DeviceEntity } from '../../device/entities/device.entity';
import { CreateDeviceTypeDto } from '../../device-type/dtos/create-device-type.dto';
import type { DeviceTypeDto } from '../../device-type/dtos/device-type.dto';
import { UpdateDeviceTypeDto } from '../../device-type/dtos/update-device-type.dto';
import { DeviceTypeEntity } from '../../device-type/entities/device-type.entity';
import DeviceTypeMapper from '../../device-type/mappers/device-type.mapper';

@Injectable()
export class DeviceTypeService {
  constructor(
    @InjectRepository(DeviceTypeEntity)
    private readonly deviceTypeRepository: Repository<DeviceTypeEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly deviceTypeMapper: DeviceTypeMapper,
  ) {}

  async getAllDeviceTypes(): Promise<DeviceTypeDto[]> {
    const deviceTypes = await this.deviceTypeRepository
      .createQueryBuilder('type')
      .leftJoinAndSelect('type.models', 'models')
      .orderBy('type.name', 'ASC')
      .addOrderBy('models.name', 'ASC')
      .getMany();

    return deviceTypes.toDtos();
  }

  @Transactional()
  async createDeviceType(
    createDeviceTypeDto: CreateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    await this.verifyDeviceTypeBeforeCreate(createDeviceTypeDto);

    const deviceTypeEntity = plainToInstance(
      DeviceTypeEntity,
      createDeviceTypeDto,
    );
    const deviceType = await this.deviceTypeRepository.save(deviceTypeEntity);

    return deviceType.toDto();
  }

  @Transactional()
  async updateDeviceType(
    typeId: number,
    updateDeviceTypeDto: UpdateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    await this.verifyDeviceTypeBeforeUpdate(typeId, updateDeviceTypeDto);

    const currentType =
      await this.deviceTypeMapper.toDeviceTypeEntityFromId(typeId);

    currentType.name = updateDeviceTypeDto.name;

    const updatedType = await this.deviceTypeRepository.save(currentType);
    const deviceType = await this.deviceTypeRepository.findOneOrFail({
      relations: {
        models: true,
      },
      where: { id: updatedType.id },
    });

    return deviceType.toDto();
  }

  @Transactional()
  async deleteDeviceType(typeId: number): Promise<void> {
    await this.hasAssignedDevicesUnderType(typeId);
    const deviceTypeEntity =
      await this.deviceTypeMapper.toDeviceTypeEntityFromId(typeId);

    await this.deviceTypeRepository.remove(deviceTypeEntity);
  }

  private async hasAssignedDevicesUnderType(typeId: number): Promise<void> {
    const device = await this.deviceRepository.findOne({
      where: {
        type: { id: typeId },
      },
    });

    if (device) {
      throw new InvalidBadRequestException(ErrorCode.TYPE_CAN_NOT_BE_DELETED);
    }
  }

  private async verifyDeviceTypeBeforeCreate(
    createDeviceType: CreateDeviceTypeDto,
  ) {
    const existingDeviceType = await this.deviceTypeRepository
      .createQueryBuilder('deviceType')
      .where('LOWER(deviceType.name) = LOWER(:typeName)', {
        typeName: createDeviceType.name,
      })
      .getOne();

    if (existingDeviceType) {
      throw new InvalidBadRequestException(ErrorCode.TYPE_IS_EXISTING);
    }
  }

  private async verifyDeviceTypeBeforeUpdate(
    typeId: number,
    updateDeviceType: UpdateDeviceTypeDto,
  ) {
    const existingDeviceType = await this.deviceTypeRepository
      .createQueryBuilder('deviceType')
      .where(
        'deviceType.id <> :deviceTypeId AND LOWER(deviceType.name) = LOWER(:typeName)',
        { deviceTypeId: typeId, typeName: updateDeviceType.name },
      )
      .getOne();

    if (existingDeviceType) {
      throw new InvalidBadRequestException(ErrorCode.TYPE_IS_EXISTING);
    }
  }
}
