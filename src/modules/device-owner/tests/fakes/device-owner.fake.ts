import type { CreateDeviceOwnerDto } from '../../dtos/create-device-owner.dto';
import type { DeviceOwnerDto } from '../../dtos/device-owner.dto';
import type { UpdateDeviceOwnerDto } from '../../dtos/update-device-owner.dto';
import type { DeviceOwnerEntity } from '../../entities/device-owner.entity';

export class DeviceOwnerFake {
  static buildDeviceOwnerDto(): DeviceOwnerDto {
    const deviceOwnerDto: DeviceOwnerDto = {
      id: 1,
      name: 'OWT_VN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return deviceOwnerDto;
  }

  static buildDeviceOwnerEntity(
    deviceOwner: DeviceOwnerDto,
  ): DeviceOwnerEntity {
    return {
      id: deviceOwner.id,
      name: deviceOwner.name,
      toDto: jest.fn(() => deviceOwner) as unknown,
    } as unknown as DeviceOwnerEntity;
  }

  static buildCreateDeviceOwnerDto(): CreateDeviceOwnerDto {
    const createDeviceOwnerDto: CreateDeviceOwnerDto = {
      name: 'OWT_VN',
    };

    return createDeviceOwnerDto;
  }

  static buildUpdateDeviceOwnerDto(): UpdateDeviceOwnerDto {
    const updateDeviceOwnerDto: UpdateDeviceOwnerDto = {
      name: 'updateOwner',
    };

    return updateDeviceOwnerDto;
  }
}
