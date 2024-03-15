import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { DeviceController } from '../../controllers/device.controller';
import { DeviceService } from '../../services/device.service';
import { DeviceFake } from '../fakes/device.fake';

describe('DeviceController', () => {
  let deviceController: DeviceController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const deviceAssigneeHistory = DeviceFake.buildDeviceAssigneeHistoryDto();
  const pageOptions = DeviceFake.buildDevicesPageOptionsDto();
  const assigneeHistoryDtosPageDto =
    DeviceFake.buildDeviceAssigneeHistoryDtosPageDto();

  const mockDeviceService = {
    getMyDevicesCurrentlyAssigned: jest.fn(),
    getDeviceAssignHistoryDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
      ],
    }).compile();

    deviceController = module.get<DeviceController>(DeviceController);
  });

  describe('getMyDevicesCurrentlyAssigned', () => {
    it('should return list of current users logged into the currently assigned device', async () => {
      jest
        .spyOn(mockDeviceService, 'getMyDevicesCurrentlyAssigned')
        .mockReturnValueOnce(assigneeHistoryDtosPageDto);

      const result = await deviceController.getMyDevicesCurrentlyAssigned(
        userEntity,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(assigneeHistoryDtosPageDto.data[0].id);
      expect(result.data[0].device).toEqual(
        assigneeHistoryDtosPageDto.data[0].device,
      );
      expect(result.data[0].user).toEqual(
        assigneeHistoryDtosPageDto.data[0].user,
      );

      expect(mockDeviceService.getMyDevicesCurrentlyAssigned).toBeCalled();
    });
  });

  describe('getDeviceAssignHistoryDetail', () => {
    it('should return device assign detail by id', async () => {
      jest
        .spyOn(mockDeviceService, 'getDeviceAssignHistoryDetail')
        .mockReturnValueOnce(deviceAssigneeHistory);

      const result = await deviceController.getDeviceAssignHistoryDetail(
        userEntity,
        deviceAssigneeHistory.id,
      );

      expect(result.id).toEqual(deviceAssigneeHistory.id);
      expect(result.device).toEqual(deviceAssigneeHistory.device);
      expect(result.user).toEqual(deviceAssigneeHistory.user);

      expect(mockDeviceService.getDeviceAssignHistoryDetail).toBeCalled();
    });
  });
});
