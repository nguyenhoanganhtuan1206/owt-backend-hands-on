import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceController } from '../../controllers/admin-device.controller';
import { DeviceService } from '../../services/device.service';
import { DeviceFake } from '../fakes/device.fake';

describe('AdminDeviceController', () => {
  let adminDeviceController: AdminDeviceController;

  const device = DeviceFake.buildDeviceDto();
  const devicePageOptions = DeviceFake.buildDevicesPageOptionsDto();
  const assigneeHistoryPageOptions =
    DeviceFake.buildDevicesAssigneeHistoryPageOptionsDto();
  const deviceDtosPageDto = DeviceFake.buildDeviceDtosPageDto();
  const assigneeHistoryDtosPageDto =
    DeviceFake.buildDeviceAssigneeHistoryDtosPageDto();

  const mockDeviceService = {
    getAllDevices: jest.fn(),
    getDeviceDetails: jest.fn(),
    getAllDeviceAssignHistoriesById: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
    deleteDevice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
      ],
    }).compile();

    adminDeviceController = module.get<AdminDeviceController>(
      AdminDeviceController,
    );
  });

  describe('getAllDevices', () => {
    it('should return all devices', async () => {
      jest
        .spyOn(mockDeviceService, 'getAllDevices')
        .mockReturnValueOnce(deviceDtosPageDto);

      const result =
        await adminDeviceController.getAllDevices(devicePageOptions);

      expect(result.data[0].id).toEqual(deviceDtosPageDto.data[0].id);
      expect(result.data[0].model).toEqual(deviceDtosPageDto.data[0].model);
      expect(result.data[0].type).toEqual(deviceDtosPageDto.data[0].type);

      expect(mockDeviceService.getAllDevices).toBeCalled();
    });
  });

  describe('getDeviceDetails', () => {
    it('should return device details by id', async () => {
      jest
        .spyOn(mockDeviceService, 'getDeviceDetails')
        .mockReturnValueOnce(device);

      const result = await adminDeviceController.getDeviceDetails(device.id);

      expect(result.id).toEqual(device.id);
      expect(result.model).toEqual(device.model);
      expect(result.type).toEqual(device.type);

      expect(mockDeviceService.getDeviceDetails).toBeCalledWith(device.id);
    });
  });

  describe('getAllDeviceAssignHistoriesById', () => {
    it('should return all assignee history of device', async () => {
      jest
        .spyOn(mockDeviceService, 'getAllDeviceAssignHistoriesById')
        .mockReturnValueOnce(assigneeHistoryDtosPageDto);

      const result =
        await adminDeviceController.getAllDeviceAssignHistoriesById(
          device.id,
          assigneeHistoryPageOptions,
        );

      expect(result.data[0].id).toEqual(assigneeHistoryDtosPageDto.data[0].id);
      expect(result.data[0].device).toEqual(
        assigneeHistoryDtosPageDto.data[0].device,
      );
      expect(result.data[0].user).toEqual(
        assigneeHistoryDtosPageDto.data[0].user,
      );

      expect(mockDeviceService.getAllDeviceAssignHistoriesById).toBeCalled();
    });
  });

  describe('createDevice', () => {
    const createDevice = DeviceFake.buildCreateDeviceDto();

    it('should create device', async () => {
      jest.spyOn(mockDeviceService, 'createDevice').mockReturnValueOnce(device);

      const result = await adminDeviceController.createDevice(createDevice);

      expect(result.id).toEqual(device.id);
      expect(result.model).toEqual(device.model);
      expect(result.type).toEqual(device.type);

      expect(mockDeviceService.createDevice).toBeCalled();
    });
  });

  describe('updateDevice', () => {
    const updateDeviceDto = DeviceFake.buildUpdateDeviceDto();

    it('should update device by id', async () => {
      jest.spyOn(mockDeviceService, 'updateDevice').mockReturnValueOnce(device);

      const result = await adminDeviceController.updateDevice(
        device.id,
        updateDeviceDto,
      );

      expect(result.id).toEqual(device.id);
      expect(result.model).toEqual(device.model);
      expect(result.type).toEqual(device.type);

      expect(mockDeviceService.updateDevice).toBeCalled();
    });
  });
});
