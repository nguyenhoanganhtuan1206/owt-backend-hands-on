import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { Order } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DeviceService } from '../../device/services/device.service';
import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import type { DeviceModelDto } from '../dtos/device-model.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { DeviceModelEntity } from '../entities/device-model.entity';
import DeviceModelMapper from '../mappers/device-model.mapper';

@Injectable()
export class DeviceModelService {
  constructor(
    @InjectRepository(DeviceModelEntity)
    private readonly deviceModelRepository: Repository<DeviceModelEntity>,
    private readonly deviceModelMapper: DeviceModelMapper,
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
  ) {}

  async getAllDeviceModels(): Promise<DeviceModelDto[]> {
    const deviceModels = await this.deviceModelRepository.find({
      order: {
        name: Order.ASC,
      },
    });

    return deviceModels.toDtos();
  }

  @Transactional()
  async createDeviceModel(
    createDeviceModelDto: CreateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    await this.verifyDeviceModelNameBeforeCreate(createDeviceModelDto);

    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntity(createDeviceModelDto);
    const model = await this.deviceModelRepository.save(deviceModelEntity);

    return model.toDto();
  }

  @Transactional()
  async updateDeviceModel(
    modelId: number,
    updateDeviceModelDto: UpdateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    await this.verifyDeviceModelBeforeUpdate(modelId, updateDeviceModelDto);

    const currentModel =
      await this.deviceModelMapper.toDeviceModelEntityFromId(modelId);

    currentModel.name = updateDeviceModelDto.name;

    const updatedModel = await this.deviceModelRepository.save(currentModel);

    return updatedModel.toDto();
  }

  @Transactional()
  async deleteDeviceModel(modelId: number): Promise<void> {
    await this.hasAssignedDevicesUnderModel(modelId);
    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntityFromId(modelId);

    await this.deviceModelRepository.remove(deviceModelEntity);
  }

  async validateDeviceModel(modelId: number, typeId: number): Promise<void> {
    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntityFromId(modelId);

    if (deviceModelEntity.type.id !== typeId) {
      throw new InvalidBadRequestException(
        ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE,
      );
    }
  }

  private async hasAssignedDevicesUnderModel(modelId: number): Promise<void> {
    const devices = await this.deviceService.findDevicesByModelId(modelId);

    if (devices.length > 0) {
      throw new InvalidBadRequestException(ErrorCode.MODEL_CAN_NOT_BE_DELETED);
    }
  }

  private async verifyDeviceModelNameBeforeCreate(
    createDeviceModel: CreateDeviceModelDto,
  ) {
    const existingDeviceModel = await this.deviceModelRepository
      .createQueryBuilder('deviceModel')
      .where('LOWER(deviceModel.name) = LOWER(:modelName)', {
        modelName: createDeviceModel.name,
      })
      .getOne();

    if (existingDeviceModel) {
      throw new InvalidBadRequestException(ErrorCode.MODEL_IS_EXISTING);
    }
  }

  private async verifyDeviceModelBeforeUpdate(
    modelId: number,
    updateDeviceModel: UpdateDeviceModelDto,
  ) {
    const existingDeviceModel = await this.deviceModelRepository
      .createQueryBuilder('deviceModel')
      .where(
        'deviceModel.id <> :deviceModelId AND LOWER(deviceModel.name) = LOWER(:modelName)',
        { deviceModelId: modelId, modelName: updateDeviceModel.name },
      )
      .getOne();

    if (existingDeviceModel) {
      throw new InvalidBadRequestException(ErrorCode.MODEL_IS_EXISTING);
    }
  }
}
