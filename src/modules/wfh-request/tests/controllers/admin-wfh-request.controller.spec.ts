import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminWfhRequestController } from '../../controllers/admin-wfh-request.controller';
import { WfhRequestService } from '../../services/wfh-request.service';
import { WfhRequestFake } from '../fakes/wfh-request.fake';

describe('AdminWfhRequestController', () => {
  let adminWfhRequestController: AdminWfhRequestController;

  const pageOptions = WfhRequestFake.buildWfhRequestsPageOptionsDto();
  const wfhRequestDtos = WfhRequestFake.buildWfhRequestPageDto();
  const wfhRequest = WfhRequestFake.buildWfhRequestDto();

  const mockWfhRequestService = {
    getAllWfhRequests: jest.fn(),
    approveWfhRequest: jest.fn(),
    refuseWfhRequest: jest.fn(),
    getWfhRequestDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWfhRequestController],
      providers: [
        {
          provide: WfhRequestService,
          useValue: mockWfhRequestService,
        },
      ],
    }).compile();

    adminWfhRequestController = module.get<AdminWfhRequestController>(
      AdminWfhRequestController,
    );
  });

  describe('getWfhRequests', () => {
    it('should return all wfh requests', async () => {
      jest
        .spyOn(mockWfhRequestService, 'getAllWfhRequests')
        .mockReturnValue(wfhRequestDtos);

      const result =
        await adminWfhRequestController.getWfhRequests(pageOptions);

      expect(result.data[0].id).toEqual(wfhRequestDtos.data[0].id);
      expect(result.data[0].dateType).toEqual(wfhRequestDtos.data[0].dateType);
      expect(result.data[0].details).toEqual(wfhRequestDtos.data[0].details);

      expect(mockWfhRequestService.getAllWfhRequests).toBeCalled();
    });
  });

  describe('approveWfhRequest', () => {
    it('should update status approve to wfh request', async () => {
      const updatedWfhRequestDto = {
        ...wfhRequest,
        status: 'APPROVED',
      };

      jest
        .spyOn(mockWfhRequestService, 'approveWfhRequest')
        .mockReturnValue(updatedWfhRequestDto);

      const result = await adminWfhRequestController.approveWfhRequest(
        wfhRequest.id,
      );

      expect(result.id).toEqual(updatedWfhRequestDto.id);
      expect(result.status).toEqual(updatedWfhRequestDto.status);
      expect(result.dateType).toEqual(updatedWfhRequestDto.dateType);
      expect(result.details).toEqual(updatedWfhRequestDto.details);

      expect(mockWfhRequestService.approveWfhRequest).toBeCalledWith(
        wfhRequest.id,
      );
    });
  });

  describe('refuseWfhRequest', () => {
    it('should update status refuse to wfh request', async () => {
      const updatedWfhRequestDto = {
        ...wfhRequest,
        status: 'REFUSED',
      };

      jest
        .spyOn(mockWfhRequestService, 'refuseWfhRequest')
        .mockReturnValue(updatedWfhRequestDto);

      const result = await adminWfhRequestController.refuseWfhRequest(
        wfhRequest.id,
      );

      expect(result.id).toEqual(updatedWfhRequestDto.id);
      expect(result.status).toEqual(updatedWfhRequestDto.status);
      expect(result.dateType).toEqual(updatedWfhRequestDto.dateType);
      expect(result.details).toEqual(updatedWfhRequestDto.details);

      expect(mockWfhRequestService.refuseWfhRequest).toBeCalledWith(
        wfhRequest.id,
      );
    });
  });

  describe('getUserWfhRequestDetails', () => {
    it('should return details wfh request of user', async () => {
      jest
        .spyOn(mockWfhRequestService, 'getWfhRequestDetails')
        .mockReturnValue(wfhRequest);

      const result = await adminWfhRequestController.getUserWfhRequestDetails(
        wfhRequest.user.id,
        wfhRequest.id,
      );

      expect(result.id).toEqual(wfhRequest.id);
      expect(result.status).toEqual(wfhRequest.status);
      expect(result.dateType).toEqual(wfhRequest.dateType);
      expect(result.details).toEqual(wfhRequest.details);

      expect(mockWfhRequestService.getWfhRequestDetails).toBeCalledWith(
        wfhRequest.user.id,
        wfhRequest.id,
      );
    });
  });
});
