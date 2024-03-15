import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceOwnerController } from '../../controllers/admin-owner.controller';
import { DeviceOwnerService } from '../../services/device-owner.service';
import { DeviceOwnerFake } from '../fakes/device-owner.fake';

describe('AdminDeviceOwnerController', () => {
  let adminDeviceOwnerController: AdminDeviceOwnerController;

  const deviceOwnerDto = DeviceOwnerFake.buildDeviceOwnerDto();

  const mockDeviceOwnerService = {
    getAllDeviceOwners: jest.fn(),
    createDeviceOwner: jest.fn(),
    updateDeviceOwner: jest.fn(),
    deleteDeviceOwner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceOwnerController],
      providers: [
        {
          provide: DeviceOwnerService,
          useValue: mockDeviceOwnerService,
        },
      ],
    }).compile();

    adminDeviceOwnerController = module.get<AdminDeviceOwnerController>(
      AdminDeviceOwnerController,
    );
  });

  describe('getAllDeviceOwners', () => {
    const deviceOwners = [deviceOwnerDto];

    it('should return all device owners', async () => {
      jest
        .spyOn(mockDeviceOwnerService, 'getAllDeviceOwners')
        .mockReturnValueOnce(deviceOwners);

      const result = await adminDeviceOwnerController.getAllDeviceOwners();

      expect(result[0].id).toEqual(deviceOwners[0].id);
      expect(result[0].name).toEqual(deviceOwners[0].name);

      expect(mockDeviceOwnerService.getAllDeviceOwners).toBeCalled();
    });
  });

  describe('createDeviceOwner', () => {
    const createDeviceOwner = DeviceOwnerFake.buildCreateDeviceOwnerDto();

    it('should create new device owner', async () => {
      jest
        .spyOn(mockDeviceOwnerService, 'createDeviceOwner')
        .mockReturnValueOnce(deviceOwnerDto);

      const result =
        await adminDeviceOwnerController.createDeviceOwner(createDeviceOwner);

      expect(result.id).toEqual(deviceOwnerDto.id);
      expect(result.name).toEqual(deviceOwnerDto.name);

      expect(mockDeviceOwnerService.createDeviceOwner).toBeCalled();
    });
  });

  describe('updateDeviceOwner', () => {
    const updateDeviceOwner = DeviceOwnerFake.buildUpdateDeviceOwnerDto();

    it('should update device owner', async () => {
      jest
        .spyOn(mockDeviceOwnerService, 'updateDeviceOwner')
        .mockReturnValueOnce(deviceOwnerDto);

      const result = await adminDeviceOwnerController.updateDeviceOwner(
        deviceOwnerDto.id,
        updateDeviceOwner,
      );

      expect(result.id).toEqual(deviceOwnerDto.id);
      expect(result.name).toEqual(deviceOwnerDto.name);

      expect(mockDeviceOwnerService.updateDeviceOwner).toBeCalled();
    });
  });

  describe('deleteDeviceOwner', () => {
    it('should delete device owner by id', async () => {
      jest.spyOn(mockDeviceOwnerService, 'deleteDeviceOwner');

      await adminDeviceOwnerController.deleteDeviceOwner(deviceOwnerDto.id);

      expect(mockDeviceOwnerService.deleteDeviceOwner).toBeCalledWith(
        deviceOwnerDto.id,
      );
    });
  });
});
