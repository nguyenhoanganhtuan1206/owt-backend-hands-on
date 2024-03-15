import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { Order } from '../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import { DateProvider } from '../../../providers';
import { DeviceService } from '../../device/services/device.service';
import { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import type { DeviceRepairHistoryPageOptionsDto } from '../dtos/device-repair-history-page-options.dto';
import type { RepairHistoryDto } from '../dtos/repair-history.dto';
import { RepairHistoryEntity } from '../entities/repair-history.entity';
import RepairHistoryMapper from '../mappers/repair-history.mapper';

@Injectable()
export class RepairHistoryService {
  private readonly allowedFieldsToSorting: Map<string, string> = new Map([
    ['assignedAt', 'deviceAssigneeHistory.assignedAt'],
  ]);

  constructor(
    @InjectRepository(RepairHistoryEntity)
    private deviceRepairHistoryRepository: Repository<RepairHistoryEntity>,
    private readonly deviceService: DeviceService,
    private readonly repairHistoryMapper: RepairHistoryMapper,
  ) {}

  async getAllDeviceRepairHistories(
    deviceId: number,
    pageOptionsDto: DeviceRepairHistoryPageOptionsDto,
  ): Promise<PageDto<RepairHistoryDto>> {
    const device = await this.deviceService.findDeviceById(deviceId);

    pageOptionsDto.deviceIds = [device.id];

    const queryBuilder =
      this.createDeviceRepairHistoryQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createDeviceRepairHistory(
    createDeviceRepairHistory: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryDto> {
    const deviceEntity = await this.deviceService.findDeviceById(
      createDeviceRepairHistory.deviceId,
    );
    this.validateRepairDate(createDeviceRepairHistory.repairDate);

    const repairHistoryEntity =
      await this.repairHistoryMapper.toRepairHistoryEntity(
        deviceEntity,
        createDeviceRepairHistory,
      );

    const newRepairHistoryEntity =
      await this.deviceRepairHistoryRepository.save(repairHistoryEntity);

    return newRepairHistoryEntity.toDto();
  }

  @Transactional()
  async deleteDeviceRepairHistory(repairId: number): Promise<void> {
    const currentRepairHistory =
      await this.deviceRepairHistoryRepository.findOneBy({
        id: repairId,
      });

    if (!currentRepairHistory) {
      throw new InvalidNotFoundException(
        ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND,
      );
    }

    await this.deviceRepairHistoryRepository.remove(currentRepairHistory);
  }

  private validateRepairDate(repairDate: Date): void {
    const currentDate = DateProvider.extractCurrentDate();
    const repairDateExtra = DateProvider.extractDateUTC(repairDate);

    if (repairDateExtra > currentDate) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_SELECT_REPAIR_DATE_IN_FUTURE,
      );
    }
  }

  private createDeviceRepairHistoryQueryBuilder(
    pageOptionsDto: DeviceRepairHistoryPageOptionsDto,
  ): SelectQueryBuilder<RepairHistoryEntity> {
    const { deviceIds } = pageOptionsDto;

    const queryBuilder = this.deviceRepairHistoryRepository
      .createQueryBuilder('repairHistory')
      .leftJoinAndSelect('repairHistory.device', 'device')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('repairHistory.requestedBy', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.permissions', 'permissions');

    queryBuilder.addOrderBy('repairHistory.createdAt', Order.DESC);

    if (deviceIds?.length) {
      queryBuilder.andWhere('device.id IN (:...deviceIds)', {
        deviceIds,
      });
    }

    return queryBuilder;
  }
}
