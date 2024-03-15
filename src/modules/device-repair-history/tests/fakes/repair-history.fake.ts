import type { PageDto } from '../../../../common/dto/page.dto';
import { Order } from '../../../../constants';
import { DeviceFake } from '../../../device/tests/fakes/device.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateDeviceRepairHistoryDto } from '../../dtos/create-device-repair-history.dto';
import type { DeviceRepairHistoryPageOptionsDto } from '../../dtos/device-repair-history-page-options.dto';
import type { RepairHistoryDto } from '../../dtos/repair-history.dto';
import type { RepairHistoryEntity } from '../../entities/repair-history.entity';

export class RepairHistoryFake {
  static buildRepairHistoryDto(): RepairHistoryDto {
    const repairHistoryDto: RepairHistoryDto = {
      id: 1,
      device: DeviceFake.buildDeviceDto(),
      requestedBy: UserFake.buildUserDto(),
      repairDate: new Date(),
      repairDetail: 'detail',
      supplier: 'supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return repairHistoryDto;
  }

  static buildRepairHistoryEntity(
    repairHistory: RepairHistoryDto,
  ): RepairHistoryEntity {
    return {
      id: repairHistory.id,
      device: repairHistory.device,
      requestedBy: repairHistory.requestedBy,
      repairDate: repairHistory.repairDate,
      repairDetail: repairHistory.repairDetail,
      supplier: repairHistory.supplier,
      toDto: jest.fn(() => repairHistory) as unknown,
    } as RepairHistoryEntity;
  }

  static buildCreateDeviceRepairHistoryDto(): CreateDeviceRepairHistoryDto {
    const createDeviceRepairHistoryDto: CreateDeviceRepairHistoryDto = {
      deviceId: DeviceFake.buildDeviceDto().id,
      requestedBy: UserFake.buildUserDto().id,
      repairDate: new Date(),
      repairDetail: 'detail',
      supplier: 'supplier',
    };

    return createDeviceRepairHistoryDto;
  }

  static buildRepairHistoryPageOptionsDto(): DeviceRepairHistoryPageOptionsDto {
    const pageOptions: DeviceRepairHistoryPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
    };

    return pageOptions;
  }

  static buildRepairHistoryDtosPageDto(): PageDto<RepairHistoryDto> {
    const repairHistoryDtos: PageDto<RepairHistoryDto> = {
      data: [RepairHistoryFake.buildRepairHistoryDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return repairHistoryDtos;
  }
}
