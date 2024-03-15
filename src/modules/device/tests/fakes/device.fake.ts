import type { PageDto } from 'common/dto/page.dto';

import { DeviceStatus, Order } from '../../../../constants';
import { DeviceModelFake } from '../../../device-model/tests/fakes/device-model.fake';
import { DeviceOwnerFake } from '../../../device-owner/tests/fakes/device-owner.fake';
import { DeviceTypeFake } from '../../../device-type/tests/fakes/device-type.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateDeviceDto } from '../../dtos/create-device.dto';
import type { DeviceDto } from '../../dtos/device.dto';
import type { DeviceAssignHistoryPageOptionsDto } from '../../dtos/device-assign-history-page-options.dto';
import type { DeviceAssigneeHistoryDto } from '../../dtos/device-assignee-history.dto';
import type { DevicesPageOptionsDto } from '../../dtos/device-page-options.dto';
import type { UpdateDeviceDto } from '../../dtos/update-device.dto';
import type { DeviceEntity } from '../../entities/device.entity';
import type { DeviceAssigneeHistoryEntity } from '../../entities/device-assiginee-history.entity';

export class DeviceFake {
  static buildDeviceDto(): DeviceDto {
    const deviceDto: DeviceDto = {
      id: 1,
      model: DeviceModelFake.buildDeviceModelDto(),
      type: DeviceTypeFake.buildDeviceTypeDto(),
      serialNumber: '123',
      detail: 'detail',
      note: 'note',
      user: UserFake.buildUserDto(),
      status: DeviceStatus.HEALTHY,
      createdAt: new Date(),
      updatedAt: new Date(),
      code: '123',
      owner: DeviceOwnerFake.buildDeviceOwnerDto(),
      purchasedAt: new Date(),
    };

    return deviceDto;
  }

  static buildDeviceEntity(device: DeviceDto): DeviceEntity {
    return {
      id: device.id,
      model: DeviceModelFake.buildDeviceModelEntity(device.model),
      type: DeviceTypeFake.buildDeviceTypeEntity(device.type),
      owner: device.owner
        ? DeviceOwnerFake.buildDeviceOwnerEntity(device.owner)
        : null,
      user: device.user ? UserFake.buildUserEntity(device.user) : null,
      serialNumber: device.serialNumber,
      detail: device.detail,
      toDto: jest.fn(() => device) as unknown,
    } as unknown as DeviceEntity;
  }

  static buildDeviceAssigneeHistoryDto(): DeviceAssigneeHistoryDto {
    const deviceAssigneeHistoryDto: DeviceAssigneeHistoryDto = {
      id: 1,
      device: DeviceFake.buildDeviceDto(),
      user: UserFake.buildUserDto(),
      assignedAt: new Date(),
      returnedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return deviceAssigneeHistoryDto;
  }

  static buildDeviceAssigneeHistoryEntity(
    deviceAssigneeHistory: DeviceAssigneeHistoryDto,
  ): DeviceAssigneeHistoryEntity {
    return {
      id: deviceAssigneeHistory.id,
      device: DeviceFake.buildDeviceEntity(deviceAssigneeHistory.device),
      user: UserFake.buildUserEntity(deviceAssigneeHistory.user),
      toDto: jest.fn(() => deviceAssigneeHistory) as unknown,
    } as unknown as DeviceAssigneeHistoryEntity;
  }

  static buildDevicesPageOptionsDto(): DevicesPageOptionsDto {
    const pageOptions: DevicesPageOptionsDto = {
      code: '123',
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
      detail: 'detail',
      serialNumber: '123',
      sortColumn: 'date',
    };

    return pageOptions;
  }

  static buildDevicesAssigneeHistoryPageOptionsDto(): DeviceAssignHistoryPageOptionsDto {
    const pageOptions: DeviceAssignHistoryPageOptionsDto = {
      orderBy: Order.ASC,
      page: 1,
      take: 10,
      query: 'search',
      skip: 0,
      sortColumn: 'date',
    };

    return pageOptions;
  }

  static buildDeviceAssigneeHistoryDtosPageDto(): PageDto<DeviceAssigneeHistoryDto> {
    const deviceDtos: PageDto<DeviceAssigneeHistoryDto> = {
      data: [DeviceFake.buildDeviceAssigneeHistoryDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return deviceDtos;
  }

  static buildDeviceDtosPageDto(): PageDto<DeviceDto> {
    const deviceDtos: PageDto<DeviceDto> = {
      data: [DeviceFake.buildDeviceDto()],
      meta: {
        page: 1,
        take: 1,
        itemCount: 1,
        pageCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    return deviceDtos;
  }

  static buildCreateDeviceDto(): CreateDeviceDto {
    const createDevice: CreateDeviceDto = {
      typeId: 1,
      modelId: 1,
      serialNumber: '123',
      detail: 'detail',
      assigneeId: 1,
      note: 'note',
      status: DeviceStatus.HEALTHY,
      code: '123',
      ownerId: 1,
      purchasedAt: new Date(),
    };

    return createDevice;
  }

  static buildUpdateDeviceDto(): UpdateDeviceDto {
    const updateDeviceDto: UpdateDeviceDto = {
      typeId: 1,
      modelId: 1,
      serialNumber: '123',
      detail: 'detail',
      assigneeId: 1,
      note: 'note',
      status: DeviceStatus.HEALTHY,
      code: '123',
      ownerId: 1,
      purchasedAt: new Date(),
    };

    return updateDeviceDto;
  }
}
