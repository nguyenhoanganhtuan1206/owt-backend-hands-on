import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { DeviceStatus, Order } from '../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import { DeviceModelService } from '../../device-model/services/device-model.service';
import type { UserEntity } from '../../user/entities/user.entity';
import { CreateDeviceDto } from '../dtos/create-device.dto';
import type { DeviceDto } from '../dtos/device.dto';
import type { DeviceAssignHistoryPageOptionsDto } from '../dtos/device-assign-history-page-options.dto';
import type { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import type { DevicesPageOptionsDto } from '../dtos/device-page-options.dto';
import { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceEntity } from '../entities/device.entity';
import { DeviceAssigneeHistoryEntity } from '../entities/device-assiginee-history.entity';
import DeviceMapper from '../mappers/device.mapper';

@Injectable()
export class DeviceService {
  private readonly allowedFieldsToSorting: Map<string, string> = new Map([
    ['assignedAt', 'deviceAssigneeHistory.assignedAt'],
  ]);

  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceAssigneeHistoryEntity)
    private deviceAssigneeHistoryRepository: Repository<DeviceAssigneeHistoryEntity>,
    private readonly deviceMapper: DeviceMapper,
    @Inject(forwardRef(() => DeviceModelService))
    private readonly deviceModelService: DeviceModelService,
  ) {}

  async getAllDevices(
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceDto>> {
    const queryBuilder = this.getDeviceQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getMyDevicesCurrentlyAssigned(
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceAssigneeHistoryDto>> {
    const queryBuilder =
      this.getDeviceAssigneeHistoryQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createDevice(createDeviceDto: CreateDeviceDto): Promise<DeviceDto> {
    await this.validateDeviceBeforeCreate(createDeviceDto);

    const deviceEntity =
      await this.deviceMapper.toDeviceEntity(createDeviceDto);

    const newDevice = await this.deviceRepository.save(deviceEntity);

    await this.createNewDeviceAssigneeHistory(newDevice);

    return newDevice.toDto();
  }

  @Transactional()
  async updateDevice(
    deviceId: number,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceDto> {
    const currentDevice = await this.findDeviceById(deviceId);

    await this.validateDeviceBeforeUpdate(currentDevice, updateDeviceDto);

    const previousAssignUser = currentDevice.user;

    const deviceEntity = await this.deviceMapper.toDeviceEntityToUpdate(
      currentDevice,
      updateDeviceDto,
    );
    const updatedDevice = await this.deviceRepository.save(deviceEntity);

    if (updateDeviceDto.assigneeId !== previousAssignUser?.id) {
      if (previousAssignUser) {
        await this.updateDeviceAssigneeHistoryWhenReturn(updatedDevice);
      }

      if (!previousAssignUser || updateDeviceDto.assigneeId) {
        await this.createNewDeviceAssigneeHistory(updatedDevice);
      }
    }

    return updatedDevice.toDto();
  }

  @Transactional()
  async deleteDevice(deviceId: number): Promise<void> {
    const currentDevice = await this.findDeviceById(deviceId);

    if (currentDevice.user) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_HAS_ASSIGNEE,
      );
    }

    await this.validateDeviceAssignmentHistory(currentDevice);
    await this.validateDeviceRepairHistory(currentDevice.id);

    await this.deviceRepository.remove(currentDevice);
  }

  private validateDeviceStatus(
    status: DeviceStatus,
    assigneeId: number | null,
  ): void {
    if (assigneeId && status === DeviceStatus.SCRAPPED) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_UPDATE_STATUS_SCRAPPED_WITH_ASSIGNEE,
      );
    }
  }

  private async validateDeviceAssignmentHistory(
    deviceEntity: DeviceEntity,
  ): Promise<void> {
    const hasDeviceAssignHistory =
      await this.deviceAssigneeHistoryRepository.countBy({
        device: { id: deviceEntity.id },
      });

    if (hasDeviceAssignHistory !== 0) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_ASSIGN_HISTORY,
      );
    }
  }

  private async validateDeviceRepairHistory(deviceId: number): Promise<void> {
    const histories = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoin('device.repairHistories', 'repairHistories')
      .where('repairHistories.device_id = :deviceId', { deviceId })
      .getCount();

    if (histories !== 0) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_REPAIR_HISTORY,
      );
    }
  }

  async getDeviceDetails(deviceId: number): Promise<DeviceDto> {
    const deviceEntity = await this.findDeviceById(deviceId);

    return deviceEntity.toDto();
  }

  async getDeviceAssignHistoryDetail(
    user: UserEntity,
    deviceAssignId: number,
  ): Promise<DeviceAssigneeHistoryDto> {
    const deviceAssigneeHistory =
      await this.deviceAssigneeHistoryRepository.findOne({
        where: {
          id: deviceAssignId,
          user: { id: user.id },
        },
      });

    if (!deviceAssigneeHistory || deviceAssigneeHistory.returnedAt !== null) {
      throw new InvalidBadRequestException(
        ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND,
      );
    }

    return deviceAssigneeHistory.toDto();
  }

  async getAllDeviceAssignHistoriesById(
    deviceId: number,
    pageOptionsDto: DeviceAssignHistoryPageOptionsDto,
  ): Promise<PageDto<DeviceAssigneeHistoryDto>> {
    const device = await this.findDeviceById(deviceId);

    pageOptionsDto.deviceIds = [device.id];

    const queryBuilder =
      this.createDeviceAssigneeHistoryQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  private async createNewDeviceAssigneeHistory(
    deviceEntity: DeviceEntity,
  ): Promise<void> {
    const count = await this.deviceAssigneeHistoryRepository.countBy({
      device: { id: deviceEntity.id },
    });
    const deviceAssigneeHistory =
      await this.getDeviceAssigneeHistoryNotReturned(deviceEntity.id);

    if (deviceEntity.user && (count === 0 || !deviceAssigneeHistory)) {
      const deviceAssigneeHistoryEntity = new DeviceAssigneeHistoryEntity();

      deviceAssigneeHistoryEntity.user = deviceEntity.user;
      deviceAssigneeHistoryEntity.device = deviceEntity;
      deviceAssigneeHistoryEntity.returnedAt = null;

      await this.deviceAssigneeHistoryRepository.save(
        deviceAssigneeHistoryEntity,
      );
    }
  }

  private async updateDeviceAssigneeHistoryWhenReturn(
    deviceEntity: DeviceEntity,
  ): Promise<void> {
    const deviceAssigneeHistoryEntity =
      await this.getDeviceAssigneeHistoryNotReturned(deviceEntity.id);

    if (deviceAssigneeHistoryEntity) {
      deviceAssigneeHistoryEntity.returnedAt = new Date();

      await this.deviceAssigneeHistoryRepository.save(
        deviceAssigneeHistoryEntity,
      );
    }
  }

  private async validateDeviceBeforeCreate(
    createDevice: CreateDeviceDto,
  ): Promise<void> {
    await this.deviceModelService.validateDeviceModel(
      createDevice.modelId,
      createDevice.typeId,
    );
    this.validateDeviceStatus(createDevice.status, createDevice.assigneeId);

    if (createDevice.code !== null) {
      const existingDeviceWithCode = await this.deviceRepository.findOneBy({
        code: createDevice.code,
      });

      if (existingDeviceWithCode) {
        throw new InvalidBadRequestException(ErrorCode.DEVICE_CODE_IS_EXISTING);
      }
    }
  }

  private async validateDeviceBeforeUpdate(
    existingDevice: DeviceEntity,
    updateDevice: UpdateDeviceDto,
  ): Promise<void> {
    await this.deviceModelService.validateDeviceModel(
      updateDevice.modelId,
      updateDevice.typeId,
    );
    this.validateDeviceStatus(updateDevice.status, updateDevice.assigneeId);

    if (
      updateDevice.code !== null &&
      existingDevice.code !== updateDevice.code
    ) {
      const queryBuilder = this.deviceRepository
        .createQueryBuilder('device')
        .where(`device.id <> :deviceId AND device.code = :code`, {
          deviceId: existingDevice.id,
          code: updateDevice.code,
        });

      const existingDeviceWithCode = await queryBuilder.getOne();

      if (existingDeviceWithCode) {
        throw new InvalidBadRequestException(ErrorCode.DEVICE_CODE_IS_EXISTING);
      }
    }
  }

  private async getDeviceAssigneeHistoryNotReturned(
    id: number,
  ): Promise<DeviceAssigneeHistoryEntity | null> {
    return this.deviceAssigneeHistoryRepository
      .createQueryBuilder('deviceAssigneeHistory')
      .where('deviceAssigneeHistory.device_id = :deviceId', {
        deviceId: id,
      })
      .andWhere('deviceAssigneeHistory.returnedAt IS NULL')
      .getOne();
  }

  async findDeviceById(id: number): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOneBy({ id });

    if (!device) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_NOT_FOUND);
    }

    return device;
  }

  async findDevicesByModelId(modelId: number): Promise<DeviceEntity[]> {
    return this.deviceRepository.find({
      where: {
        model: { id: modelId },
      },
    });
  }

  private getDeviceAssigneeHistoryQueryBuilder(
    pageOptionsDto: DevicesPageOptionsDto,
  ): SelectQueryBuilder<DeviceAssigneeHistoryEntity> {
    const {
      dateFrom,
      dateTo,
      typeIds,
      modelIds,
      detail,
      serialNumber,
      userIds,
      orderBy,
      sortColumn,
    } = pageOptionsDto;

    const queryBuilder = this.deviceAssigneeHistoryRepository
      .createQueryBuilder('deviceAssigneeHistory')
      .leftJoinAndSelect('deviceAssigneeHistory.device', 'device')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('deviceAssigneeHistory.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions');

    queryBuilder.andWhere('deviceAssigneeHistory.returnedAt IS NULL');

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        '(DATE(deviceAssigneeHistory.assignedAt) BETWEEN :dateFrom AND :dateTo)',
        {
          dateFrom,
          dateTo,
        },
      );
    }

    if (typeIds?.length) {
      queryBuilder.andWhere('device.type_id IN (:...typeIds)', {
        typeIds,
      });
    }

    if (modelIds?.length) {
      queryBuilder.andWhere('device.model_id IN (:...modelIds)', {
        modelIds,
      });
    }

    if (detail) {
      queryBuilder.andWhere('LOWER(device.detail) LIKE LOWER(:detail)', {
        detail: `%${detail.toLowerCase()}%`,
      });
    }

    if (serialNumber) {
      queryBuilder.andWhere(
        'LOWER(device.serial_number) LIKE LOWER(:serialNumber)',
        {
          serialNumber: `%${serialNumber.toLowerCase()}%`,
        },
      );
    }

    if (userIds?.length) {
      queryBuilder.andWhere('device.user.id in (:...userIds)', { userIds });
    }

    const sort = this.allowedFieldsToSorting.get(sortColumn);

    if (sort) {
      queryBuilder.orderBy(sort, orderBy);
    } else {
      queryBuilder.orderBy('deviceAssigneeHistory.assignedAt', Order.DESC);
    }

    return queryBuilder;
  }

  private getDeviceQueryBuilder(
    pageOptionsDto: DevicesPageOptionsDto,
  ): SelectQueryBuilder<DeviceEntity> {
    const {
      typeIds,
      modelIds,
      ownerIds,
      detail,
      code,
      serialNumber,
      statuses,
      userIds,
      orderBy,
    } = pageOptionsDto;

    const queryBuilder = this.deviceRepository
      .createQueryBuilder('device')
      .addSelect(
        'CASE WHEN device.user.id IS NULL THEN 0 ELSE 1 END',
        'assignee_order',
      )
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.owner', 'owner')
      .leftJoinAndSelect('device.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel')
      .leftJoinAndSelect('user.permissions', 'permissions');

    if (userIds?.length) {
      const isUnassigned = userIds.map(Number).includes(0);
      const filteredUserIds = userIds.filter((id) => Number(id) !== 0);

      if (isUnassigned) {
        if (filteredUserIds.length > 0) {
          queryBuilder.andWhere(
            '(device.user.id IS NULL OR device.user.id IN (:...filteredUserIds))',
            { filteredUserIds },
          );
        } else {
          queryBuilder.andWhere('(device.user.id IS NULL)');
        }
      } else {
        queryBuilder.andWhere('(device.user.id IN (:...userIds))', { userIds });
      }
    }

    if (typeIds?.length) {
      queryBuilder.andWhere('device.type_id IN (:...typeIds)', {
        typeIds,
      });
    }

    if (modelIds?.length) {
      queryBuilder.andWhere('device.model_id IN (:...modelIds)', {
        modelIds,
      });
    }

    if (ownerIds?.length) {
      queryBuilder.andWhere('device.owner_id IN (:...ownerIds)', {
        ownerIds,
      });
    }

    if (detail) {
      queryBuilder.andWhere('LOWER(device.detail) LIKE LOWER(:detail)', {
        detail: `%${detail.toLowerCase()}%`,
      });
    }

    if (code) {
      queryBuilder.andWhere('LOWER(device.code) LIKE LOWER(:code)', {
        code: `%${code.toLowerCase()}%`,
      });
    }

    if (serialNumber) {
      queryBuilder.andWhere(
        'LOWER(device.serial_number) LIKE LOWER(:serialNumber)',
        {
          serialNumber: `%${serialNumber.toLowerCase()}%`,
        },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('device.status IN (:...statuses)', {
        statuses,
      });
    }

    queryBuilder.orderBy('assignee_order', orderBy);
    queryBuilder.addOrderBy('device.createdAt', Order.DESC);

    return queryBuilder;
  }

  private createDeviceAssigneeHistoryQueryBuilder(
    pageOptionsDto: DeviceAssignHistoryPageOptionsDto,
  ): SelectQueryBuilder<DeviceAssigneeHistoryEntity> {
    const { deviceIds } = pageOptionsDto;

    const queryBuilder = this.deviceAssigneeHistoryRepository
      .createQueryBuilder('deviceAssigneeHistory')
      .leftJoinAndSelect('deviceAssigneeHistory.device', 'device')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('deviceAssigneeHistory.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions');

    queryBuilder.addOrderBy('deviceAssigneeHistory.assignedAt', Order.DESC);

    if (deviceIds?.length) {
      queryBuilder.andWhere('device.id IN (:...deviceIds)', { deviceIds });
    }

    return queryBuilder;
  }
}
