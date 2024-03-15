import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminDeviceRepairRequestController } from '../../controllers/admin-repair-request.controller';
import { RepairRequestService } from '../../services/repair-request.service';
import { RepairRequestFake } from '../fakes/repair-request.fake';

describe('AdminDeviceRepairRequestController', () => {
  let adminDeviceRepairRequestController: AdminDeviceRepairRequestController;

  const pageOptions = RepairRequestFake.buildRepairRequestPageOptionsDto();
  const expectedRepairRequestDtos =
    RepairRequestFake.buildRepairRequestDtosPageDto();
  const repairRequest = RepairRequestFake.buildRepairRequestDto();
  const pendingRequest = RepairRequestFake.buildPendingRequestDto();
  const updateRepairRequestStatusDto =
    RepairRequestFake.buildUpdateRepairRequestStatusDto();

  const mockRepairRequestService = {
    getAllRepairRequests: jest.fn(),
    getRepairRequestDetails: jest.fn(),
    getPendingRequests: jest.fn(),
    approveRepairRequest: jest.fn(),
    refuseRepairRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeviceRepairRequestController],
      providers: [
        {
          provide: RepairRequestService,
          useValue: mockRepairRequestService,
        },
      ],
    }).compile();

    adminDeviceRepairRequestController =
      module.get<AdminDeviceRepairRequestController>(
        AdminDeviceRepairRequestController,
      );
  });

  describe('Get all repair requests', () => {
    it('should return a page of repair requests', async () => {
      jest
        .spyOn(mockRepairRequestService, 'getAllRepairRequests')
        .mockReturnValue(expectedRepairRequestDtos);

      const result =
        await adminDeviceRepairRequestController.getAllRepairRequests(
          pageOptions,
        );

      expect(result.data[0].id).toEqual(expectedRepairRequestDtos.data[0].id);
      expect(result.data[0].reason).toEqual(
        expectedRepairRequestDtos.data[0].reason,
      );
      expect(result.data[0].note).toEqual(
        expectedRepairRequestDtos.data[0].note,
      );

      expect(mockRepairRequestService.getAllRepairRequests).toBeCalled();
    });
  });

  describe('Get total pending requests for current user login', () => {
    it('should return total pending requests', async () => {
      jest
        .spyOn(mockRepairRequestService, 'getPendingRequests')
        .mockReturnValue(pendingRequest);

      const result =
        await adminDeviceRepairRequestController.getPendingRequests();

      expect(result.total).toEqual(pendingRequest.total);

      expect(mockRepairRequestService.getPendingRequests).toBeCalled();
    });
  });

  describe('Get repair request detail by id', () => {
    it('should return repair request detail', async () => {
      jest
        .spyOn(mockRepairRequestService, 'getRepairRequestDetails')
        .mockReturnValue(repairRequest);

      const result =
        await adminDeviceRepairRequestController.getRepairRequestDetails(
          repairRequest.id,
        );

      expect(result.id).toEqual(repairRequest.id);
      expect(result.reason).toEqual(repairRequest.reason);
      expect(result.note).toEqual(repairRequest.note);

      expect(mockRepairRequestService.getRepairRequestDetails).toBeCalled();
    });
  });

  describe('Update status approve to repair request', () => {
    it('should update status approve to repair request', async () => {
      jest
        .spyOn(mockRepairRequestService, 'approveRepairRequest')
        .mockReturnValue(repairRequest);

      const result =
        await adminDeviceRepairRequestController.approveRepairRequest(
          repairRequest.id,
          updateRepairRequestStatusDto,
        );

      expect(result.id).toEqual(repairRequest.id);
      expect(result.reason).toEqual(repairRequest.reason);
      expect(result.status).toEqual(repairRequest.status);
      expect(result.note).toEqual(repairRequest.note);

      expect(mockRepairRequestService.approveRepairRequest).toBeCalled();
    });
  });

  describe('Update status refuse to repair request', () => {
    it('should update status refuse to repair request', async () => {
      jest
        .spyOn(mockRepairRequestService, 'refuseRepairRequest')
        .mockReturnValue(repairRequest);

      const result =
        await adminDeviceRepairRequestController.refuseRepairRequest(
          repairRequest.id,
          updateRepairRequestStatusDto,
        );

      expect(result.id).toEqual(repairRequest.id);
      expect(result.reason).toEqual(repairRequest.reason);
      expect(result.status).toEqual(repairRequest.status);
      expect(result.note).toEqual(repairRequest.note);

      expect(mockRepairRequestService.refuseRepairRequest).toBeCalled();
    });
  });
});
