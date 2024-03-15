import { DeviceTypeFake } from '../../../device-type/tests/fakes/device-type.fake';
import type { CreateDeviceModelDto } from '../../dtos/create-device-model.dto';
import type { DeviceModelDto } from '../../dtos/device-model.dto';
import type { UpdateDeviceModelDto } from '../../dtos/update-device-model.dto';
import type { DeviceModelEntity } from '../../entities/device-model.entity';

export class DeviceModelFake {
  static buildDeviceModelDto(): DeviceModelDto {
    const deviceModelDto: DeviceModelDto = {
      id: 1,
      name: 'model',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return deviceModelDto;
  }

  static buildDeviceModelEntity(
    deviceModel: DeviceModelDto,
  ): DeviceModelEntity {
    const deviceType = DeviceTypeFake.buildDeviceTypeDto();

    return {
      id: deviceModel.id,
      name: deviceModel.name,
      type: DeviceTypeFake.buildDeviceTypeEntity(deviceType),
      toDto: jest.fn(() => deviceModel) as unknown,
    } as unknown as DeviceModelEntity;
  }

  static buildCreateDeviceModelDto(): CreateDeviceModelDto {
    const createDeviceModelDto: CreateDeviceModelDto = {
      name: 'model',
      typeId: 1,
    };

    return createDeviceModelDto;
  }

  static buildUpdateDeviceModelDto(): UpdateDeviceModelDto {
    const updateDeviceModelDto: UpdateDeviceModelDto = {
      name: 'model',
    };

    return updateDeviceModelDto;
  }
}
