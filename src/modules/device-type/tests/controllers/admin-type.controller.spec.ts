import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceTypeController } from '../../controllers/admin-type.controller';
import { DeviceTypeService } from '../../services/device-type.service';
import { DeviceTypeFake } from '../fakes/device-type.fake';

describe('AdminDeviceTypeController', () => {
  let adminDeviceTypeController: AdminDeviceTypeController;

  const deviceTypeDto = DeviceTypeFake.buildDeviceTypeDto();

  const mockDeviceTypeService = {
    getAllDeviceTypes: jest.fn(),
    createDeviceType: jest.fn(),
    updateDeviceType: jest.fn(),
    deleteDeviceType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceTypeController],
      providers: [
        {
          provide: DeviceTypeService,
          useValue: mockDeviceTypeService,
        },
      ],
    }).compile();

    adminDeviceTypeController = module.get<AdminDeviceTypeController>(
      AdminDeviceTypeController,
    );
  });

  describe('getAllDeviceTypes', () => {
    const deviceTypes = [deviceTypeDto];

    it('should return all device types', async () => {
      jest
        .spyOn(mockDeviceTypeService, 'getAllDeviceTypes')
        .mockReturnValueOnce(deviceTypes);

      const result = await adminDeviceTypeController.getAllDeviceTypes();

      expect(result[0].id).toEqual(deviceTypes[0].id);
      expect(result[0].name).toEqual(deviceTypes[0].name);

      expect(mockDeviceTypeService.getAllDeviceTypes).toBeCalled();
    });
  });

  describe('createDeviceType', () => {
    const createDeviceType = DeviceTypeFake.buildCreateDeviceTypeDto();

    it('should create new device type', async () => {
      jest
        .spyOn(mockDeviceTypeService, 'createDeviceType')
        .mockReturnValueOnce(deviceTypeDto);

      const result =
        await adminDeviceTypeController.createDeviceType(createDeviceType);

      expect(result.id).toEqual(deviceTypeDto.id);
      expect(result.name).toEqual(deviceTypeDto.name);

      expect(mockDeviceTypeService.createDeviceType).toBeCalled();
    });
  });

  describe('updateDeviceType', () => {
    const updateDeviceType = DeviceTypeFake.buildUpdateDeviceTypeDto();

    it('should update device type', async () => {
      jest
        .spyOn(mockDeviceTypeService, 'updateDeviceType')
        .mockReturnValueOnce(deviceTypeDto);

      const result = await adminDeviceTypeController.updateDeviceType(
        deviceTypeDto.id,
        updateDeviceType,
      );

      expect(result.id).toEqual(deviceTypeDto.id);
      expect(result.name).toEqual(deviceTypeDto.name);

      expect(mockDeviceTypeService.updateDeviceType).toBeCalled();
    });
  });

  describe('deleteDeviceType', () => {
    it('should delete device type', async () => {
      jest.spyOn(mockDeviceTypeService, 'deleteDeviceType');

      await adminDeviceTypeController.deleteDeviceType(deviceTypeDto.id);

      expect(mockDeviceTypeService.deleteDeviceType).toBeCalledWith(
        deviceTypeDto.id,
      );
    });
  });
});
