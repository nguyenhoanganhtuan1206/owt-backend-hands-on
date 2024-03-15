import type { PageDto } from '../../../../common/dto/page.dto';
import { Order, RequestStatusType } from '../../../../constants';
import { DeviceFake } from '../../../device/tests/fakes/device.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateRepairRequestDto } from '../../dtos/create-repair-request.dto';
import type { PendingRequestDto } from '../../dtos/pending-request.dto';
import type { RepairRequestDto } from '../../dtos/repair-request.dto';
import type { RepairRequestPageOptionsDto } from '../../dtos/repair-request-page-options.dto';
import type { UpdateRepairRequestStatusDto } from '../../dtos/update-repair-request-status.dto';
import type { RepairRequestEntity } from '../../entities/repair-request.entity';

export class RepairRequestFake {
  static buildRepairRequestDto(): RepairRequestDto {
    const repairRequestDto: RepairRequestDto = {
      id: 1,
      device: DeviceFake.buildDeviceDto(),
      user: UserFake.buildUserDto(),
      reason: 'reason',
      note: 'note',
      status: RequestStatusType.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return repairRequestDto;
  }

  static buildRepairRequestEntity(
    repairRequest: RepairRequestDto,
  ): RepairRequestEntity {
    return {
      id: repairRequest.id,
      user: repairRequest.user,
      device: repairRequest.device,
      status: repairRequest.status,
      note: repairRequest.note,
      reason: repairRequest.reason,
      toDto: jest.fn(() => repairRequest) as unknown,
    } as RepairRequestEntity;
  }

  static buildPendingRequestDto(): PendingRequestDto {
    const pendingRequestDto: PendingRequestDto = {
      total: 3,
    };

    return pendingRequestDto;
  }

  static buildUpdateRepairRequestStatusDto(): UpdateRepairRequestStatusDto {
    const updateRepairRequestStatusDto: UpdateRepairRequestStatusDto = {
      note: 'note',
    };

    return updateRepairRequestStatusDto;
  }

  static buildCreateRepairRequestDto(): CreateRepairRequestDto {
    const createRepairRequestDto: CreateRepairRequestDto = {
      reason: 'reason',
    };

    return createRepairRequestDto;
  }

  static buildRepairRequestPageOptionsDto(): RepairRequestPageOptionsDto {
    const pageOptions: RepairRequestPageOptionsDto = {
      sortColumn: 'date',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      serialNumber: 'test test',
      skip: 0,
      reason: 'reason',
    };

    return pageOptions;
  }

  static buildRepairRequestDtosPageDto(): PageDto<RepairRequestDto> {
    const repairRequestDtos: PageDto<RepairRequestDto> = {
      data: [RepairRequestFake.buildRepairRequestDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return repairRequestDtos;
  }
}
