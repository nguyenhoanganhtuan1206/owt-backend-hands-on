import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceModelController } from '../../controllers/admin-model.controller';
import { DeviceModelService } from '../../services/device-model.service';
import { DeviceModelFake } from '../fakes/device-model.fake';

describe('AdminDeviceModelController', () => {
  let adminDeviceModelController: AdminDeviceModelController;

  const deviceModelDto = DeviceModelFake.buildDeviceModelDto();

  const mockDeviceModelService = {
    getAllDeviceModels: jest.fn(),
    createDeviceModel: jest.fn(),
    updateDeviceModel: jest.fn(),
    deleteDeviceModel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceModelController],
      providers: [
        {
          provide: DeviceModelService,
          useValue: mockDeviceModelService,
        },
      ],
    }).compile();

    adminDeviceModelController = module.get<AdminDeviceModelController>(
      AdminDeviceModelController,
    );
  });

  describe('getAllDeviceModels', () => {
    const deviceModels = [deviceModelDto];

    it('should return all device models', async () => {
      jest
        .spyOn(mockDeviceModelService, 'getAllDeviceModels')
        .mockReturnValueOnce(deviceModels);

      const result = await adminDeviceModelController.getAllDeviceModels();

      expect(result[0].id).toEqual(deviceModels[0].id);
      expect(result[0].name).toEqual(deviceModels[0].name);

      expect(mockDeviceModelService.getAllDeviceModels).toBeCalled();
    });
  });

  describe('createDeviceModel', () => {
    const createDeviceModel = DeviceModelFake.buildCreateDeviceModelDto();

    it('should create new device model', async () => {
      jest
        .spyOn(mockDeviceModelService, 'createDeviceModel')
        .mockReturnValueOnce(deviceModelDto);

      const result =
        await adminDeviceModelController.createDeviceModel(createDeviceModel);

      expect(result.id).toEqual(deviceModelDto.id);
      expect(result.name).toEqual(deviceModelDto.name);

      expect(mockDeviceModelService.createDeviceModel).toBeCalled();
    });
  });

  describe('updateDeviceModel', () => {
    const updateDeviceModel = DeviceModelFake.buildUpdateDeviceModelDto();

    it('should update device model', async () => {
      jest
        .spyOn(mockDeviceModelService, 'updateDeviceModel')
        .mockReturnValueOnce(deviceModelDto);

      const result = await adminDeviceModelController.updateDeviceModel(
        deviceModelDto.id,
        updateDeviceModel,
      );

      expect(result.id).toEqual(deviceModelDto.id);
      expect(result.name).toEqual(deviceModelDto.name);

      expect(mockDeviceModelService.updateDeviceModel).toBeCalled();
    });
  });

  describe('deleteDeviceModel', () => {
    it('should delete device model', async () => {
      jest.spyOn(mockDeviceModelService, 'deleteDeviceModel');

      await adminDeviceModelController.deleteDeviceModel(deviceModelDto.id);

      expect(mockDeviceModelService.deleteDeviceModel).toBeCalledWith(
        deviceModelDto.id,
      );
    });
  });
});
