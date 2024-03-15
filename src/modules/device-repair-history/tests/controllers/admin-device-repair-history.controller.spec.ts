import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceRepairHistoryController } from '../../controllers/admin-device-repair-history.controller';
import { RepairHistoryService } from '../../services/repair-history.service';
import { RepairHistoryFake } from '../fakes/repair-history.fake';

describe('AdminDeviceRepairHistoryController', () => {
  let adminDeviceRepairHistoryController: AdminDeviceRepairHistoryController;

  const pageOptions = RepairHistoryFake.buildRepairHistoryPageOptionsDto();
  const expectedRepairHistoryDtos =
    RepairHistoryFake.buildRepairHistoryDtosPageDto();
  const repairHistory = RepairHistoryFake.buildRepairHistoryDto();
  const createDeviceRepairHistoryDto =
    RepairHistoryFake.buildCreateDeviceRepairHistoryDto();

  const mockRepairHistoryService = {
    getAllDeviceRepairHistories: jest.fn(),
    createDeviceRepairHistory: jest.fn(),
    deleteDeviceRepairHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceRepairHistoryController],
      providers: [
        {
          provide: RepairHistoryService,
          useValue: mockRepairHistoryService,
        },
      ],
    }).compile();

    adminDeviceRepairHistoryController =
      module.get<AdminDeviceRepairHistoryController>(
        AdminDeviceRepairHistoryController,
      );
  });

  describe('Get all device repair history by deviceId', () => {
    it('should return a page of repair history', async () => {
      jest
        .spyOn(mockRepairHistoryService, 'getAllDeviceRepairHistories')
        .mockReturnValue(expectedRepairHistoryDtos);

      const result =
        await adminDeviceRepairHistoryController.getAllDeviceRepairHistories(
          repairHistory.device.id,
          pageOptions,
        );

      expect(result.data[0].id).toEqual(expectedRepairHistoryDtos.data[0].id);
      expect(result.data[0].device).toEqual(
        expectedRepairHistoryDtos.data[0].device,
      );
      expect(result.data[0].requestedBy).toEqual(
        expectedRepairHistoryDtos.data[0].requestedBy,
      );

      expect(mockRepairHistoryService.getAllDeviceRepairHistories).toBeCalled();
    });
  });

  describe('Create device repair history', () => {
    it('should create repair history', async () => {
      jest
        .spyOn(mockRepairHistoryService, 'createDeviceRepairHistory')
        .mockReturnValue(repairHistory);

      const result =
        await adminDeviceRepairHistoryController.createDeviceRepairHistory(
          createDeviceRepairHistoryDto,
        );

      expect(result.id).toEqual(repairHistory.id);
      expect(result.device).toEqual(repairHistory.device);
      expect(result.supplier).toEqual(repairHistory.supplier);
      expect(result.repairDate).toEqual(repairHistory.repairDate);
      expect(result.repairDetail).toEqual(repairHistory.repairDetail);

      expect(mockRepairHistoryService.createDeviceRepairHistory).toBeCalled();
    });
  });

  describe('Delete device repair history', () => {
    it('should delete device repair history', async () => {
      jest.spyOn(mockRepairHistoryService, 'deleteDeviceRepairHistory');

      await adminDeviceRepairHistoryController.deleteDeviceRepairHistory(
        repairHistory.device.id,
      );

      expect(mockRepairHistoryService.deleteDeviceRepairHistory).toBeCalledWith(
        repairHistory.device.id,
      );
    });
  });
});
