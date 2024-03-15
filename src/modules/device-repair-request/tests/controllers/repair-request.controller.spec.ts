import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { DeviceRepairRequestController } from '../../controllers/repair-request.controller';
import { RepairRequestService } from '../../services/repair-request.service';
import { RepairRequestFake } from '../fakes/repair-request.fake';

describe('DeviceRepairRequestController', () => {
  let repairRequestController: DeviceRepairRequestController;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);
  const repairRequestPageOptionsDto =
    RepairRequestFake.buildRepairRequestPageOptionsDto();
  const repairRequestPageDto =
    RepairRequestFake.buildRepairRequestDtosPageDto();
  const createRepairRequestDto =
    RepairRequestFake.buildCreateRepairRequestDto();
  const repairRequestDto = RepairRequestFake.buildRepairRequestDto();

  const mockRepairRequestService = {
    getRepairRequestsOfDevice: jest.fn(),
    createRepairRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceRepairRequestController],
      providers: [
        {
          provide: RepairRequestService,
          useValue: mockRepairRequestService,
        },
      ],
    }).compile();

    repairRequestController = module.get<DeviceRepairRequestController>(
      DeviceRepairRequestController,
    );
  });

  describe('getRepairRequestsOfDevice', () => {
    it('should get list repair requests of device is assigned', async () => {
      jest
        .spyOn(mockRepairRequestService, 'getRepairRequestsOfDevice')
        .mockReturnValueOnce(repairRequestPageDto);

      const result = await repairRequestController.getRepairRequestsOfDevice(
        userEntity,
        repairRequestDto.device.id,
        repairRequestPageOptionsDto,
      );

      expect(result.data[0].id).toEqual(repairRequestPageDto.data[0].id);
      expect(result.data[0].user).toEqual(repairRequestPageDto.data[0].user);
      expect(result.data[0].device).toEqual(
        repairRequestPageDto.data[0].device,
      );

      expect(mockRepairRequestService.getRepairRequestsOfDevice).toBeCalled();
    });
  });

  describe('createRepairRequest', () => {
    it('should create repair request', async () => {
      jest
        .spyOn(mockRepairRequestService, 'createRepairRequest')
        .mockReturnValueOnce(repairRequestDto);

      const result = await repairRequestController.createRepairRequest(
        userEntity,
        repairRequestDto.device.id,
        createRepairRequestDto,
      );

      expect(result.id).toEqual(repairRequestDto.id);
      expect(result.device).toEqual(repairRequestDto.device);
      expect(result.user).toEqual(repairRequestDto.user);

      expect(mockRepairRequestService.createRepairRequest).toBeCalled();
    });
  });
});
