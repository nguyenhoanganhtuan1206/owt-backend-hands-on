import type { CreateDeviceTypeDto } from '../../../device-type/dtos/create-device-type.dto';
import type { DeviceTypeDto } from '../../../device-type/dtos/device-type.dto';
import type { UpdateDeviceTypeDto } from '../../../device-type/dtos/update-device-type.dto';
import type { DeviceTypeEntity } from '../../../device-type/entities/device-type.entity';

export class DeviceTypeFake {
  static buildDeviceTypeDto(): DeviceTypeDto {
    const deviceTypeDto: DeviceTypeDto = {
      id: 1,
      name: 'type',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return deviceTypeDto;
  }

  static buildDeviceTypeEntity(deviceType: DeviceTypeDto): DeviceTypeEntity {
    return {
      id: deviceType.id,
      name: deviceType.name,
      toDto: jest.fn(() => deviceType) as unknown,
    } as unknown as DeviceTypeEntity;
  }

  static buildCreateDeviceTypeDto(): CreateDeviceTypeDto {
    const createDeviceTypeDto: CreateDeviceTypeDto = {
      name: 'type',
    };

    return createDeviceTypeDto;
  }

  static buildUpdateDeviceTypeDto(): UpdateDeviceTypeDto {
    const updateDeviceTypeDto: UpdateDeviceTypeDto = {
      name: 'type',
    };

    return updateDeviceTypeDto;
  }
}
