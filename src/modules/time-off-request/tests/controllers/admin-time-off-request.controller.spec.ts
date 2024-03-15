import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { RequestStatusType } from '../../../../constants';
import type { ExternalUserAccessDto } from '../../../auth/dto/ExternalUserAccessDto';
import { AuthService } from '../../../auth/services/auth.service';
import { AdminTimeOffRequestController } from '../../controllers/admin-time-off-request.controller';
import type { TimeOffRequestDto } from '../../dtos/time-off-request.dto';
import { TimeOffRequestService } from '../../services/time-off-request.service';
import { TimeOffRequestFake } from '../fakes/time-off-request.fake';

describe('AdminTimeOffRequestController', () => {
  let adminTimeOffRequestController: AdminTimeOffRequestController;

  const pageOptions = TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
  const expectedTimeOffRequestDtos =
    TimeOffRequestFake.buildTimeOffRequestPageDto();
  const timeOffRequest = TimeOffRequestFake.buildTimeOffRequestDto();
  const externalUserAccess = TimeOffRequestFake.buildExternalUserAccessDto();
  const updateTimeOffRequestDto =
    TimeOffRequestFake.buildUpdateTimeOffRequestDto();

  const mockTimeOffRequestService = {
    getAllTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    getTimeOffRequestDetailsByPM: jest.fn(),
    approveTimeOffRequestByPM: jest.fn(),
    refuseTimeOffRequestByPM: jest.fn(),
    approveTimeOffRequestByAdminOrAssistant: jest.fn(),
    refuseTimeOffRequestByAdminOrAssistant: jest.fn(),
    sendEmailToAssistant: jest.fn(),
    sendEmailToPM: jest.fn(),
  };

  const mockAuthService = {
    createExternalUserAccessTokenToPM: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeOffRequestController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
      ],
    }).compile();

    adminTimeOffRequestController = module.get<AdminTimeOffRequestController>(
      AdminTimeOffRequestController,
    );
  });

  describe('getTimeOffRequests', () => {
    it('should return a page of time-off requests', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'getAllTimeOffRequests')
        .mockReturnValue(expectedTimeOffRequestDtos);

      const result =
        await adminTimeOffRequestController.getTimeOffRequests(pageOptions);

      expect(result.data[0].id).toEqual(expectedTimeOffRequestDtos.data[0].id);
      expect(result.data[0].user).toEqual(
        expectedTimeOffRequestDtos.data[0].user,
      );
      expect(result.data[0].collaborator).toEqual(
        expectedTimeOffRequestDtos.data[0].collaborator,
      );

      expect(mockTimeOffRequestService.getAllTimeOffRequests).toBeCalled();
    });
  });

  describe('getTimeOffRequestDetails', () => {
    it('should return time-off request details by id', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'getTimeOffRequestDetails')
        .mockReturnValue(timeOffRequest);

      const result =
        await adminTimeOffRequestController.getTimeOffRequestDetails(
          timeOffRequest.id,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(timeOffRequest.status);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.getTimeOffRequestDetails).toBeCalled();
    });
  });

  describe('getTimeOffRequestDetailsByPM', () => {
    it('should return time-off request details by PM', async () => {
      const accessToken = 'token';

      mockAuthService.createExternalUserAccessTokenToPM.mockResolvedValueOnce(
        accessToken,
      );

      jest
        .spyOn(mockTimeOffRequestService, 'getTimeOffRequestDetailsByPM')
        .mockReturnValue(timeOffRequest);

      const result =
        await adminTimeOffRequestController.getTimeOffRequestDetailsByPM(
          accessToken,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(timeOffRequest.status);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(
        mockTimeOffRequestService.getTimeOffRequestDetailsByPM,
      ).toBeCalled();
    });
  });

  describe('approveTimeOffRequestByPM', () => {
    it('should update status approve time-off request by PM', async () => {
      mockAuthService.createExternalUserAccessTokenToPM.mockResolvedValueOnce(
        'token',
      );

      const externalUserAccessDto: ExternalUserAccessDto = {
        ...externalUserAccess,
        accessToken: 'token',
      };

      const timeOffRequestAfterApprove: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.APPROVED,
      };

      jest
        .spyOn(mockTimeOffRequestService, 'approveTimeOffRequestByPM')
        .mockResolvedValue(timeOffRequestAfterApprove);

      const result =
        await adminTimeOffRequestController.approveTimeOffRequestByPM(
          externalUserAccessDto,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.APPROVED);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.approveTimeOffRequestByPM).toBeCalled();
    });
  });

  describe('refuseTimeOffRequestByPM', () => {
    it('should update status refuse time-off request by PM', async () => {
      mockAuthService.createExternalUserAccessTokenToPM.mockResolvedValueOnce(
        'token',
      );

      const externalUserAccessDto: ExternalUserAccessDto = {
        ...externalUserAccess,
        accessToken: 'token',
      };

      const timeOffRequestAfterRefuse: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.REFUSED,
      };

      jest
        .spyOn(mockTimeOffRequestService, 'refuseTimeOffRequestByPM')
        .mockResolvedValue(timeOffRequestAfterRefuse);

      const result =
        await adminTimeOffRequestController.refuseTimeOffRequestByPM(
          externalUserAccessDto,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.REFUSED);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.refuseTimeOffRequestByPM).toBeCalled();
    });
  });

  describe('sendEmailToPM', () => {
    it('should send email confirm time-off request to Project Manager', async () => {
      const timeOffRequestAfterSend: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.PROCESSING,
      };

      jest
        .spyOn(mockTimeOffRequestService, 'sendEmailToPM')
        .mockResolvedValue(timeOffRequestAfterSend);

      const result = await adminTimeOffRequestController.sendEmailToPM(
        timeOffRequest.id,
        updateTimeOffRequestDto,
      );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.PROCESSING);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.sendEmailToPM).toBeCalled();
    });
  });

  describe('sendEmailToAssistant', () => {
    it('should send email confirm time-off request to Assistant', async () => {
      const timeOffRequestAfterSend: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.ASSISTANT,
      };

      jest
        .spyOn(mockTimeOffRequestService, 'sendEmailToAssistant')
        .mockResolvedValue(timeOffRequestAfterSend);

      const result = await adminTimeOffRequestController.sendEmailToAssistant(
        timeOffRequest.id,
        updateTimeOffRequestDto,
      );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.ASSISTANT);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.sendEmailToAssistant).toBeCalled();
    });
  });

  describe('approveTimeOffRequestByAdminOrAssistant', () => {
    it('should update status approve time-off request by Admin', async () => {
      const timeOffRequestAfterApprove: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.APPROVED,
      };

      jest
        .spyOn(
          mockTimeOffRequestService,
          'approveTimeOffRequestByAdminOrAssistant',
        )
        .mockResolvedValue(timeOffRequestAfterApprove);

      const result =
        await adminTimeOffRequestController.approveTimeOffRequestByAdminOrAssistant(
          timeOffRequest.id,
          updateTimeOffRequestDto,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.APPROVED);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(
        mockTimeOffRequestService.approveTimeOffRequestByAdminOrAssistant,
      ).toBeCalled();
    });
  });

  describe('refuseTimeOffRequestByAdminOrAssistant', () => {
    it('should update status refuse time-off request by Admin', async () => {
      const timeOffRequestAfterRefuse: TimeOffRequestDto = {
        ...timeOffRequest,
        status: RequestStatusType.REFUSED,
      };

      jest
        .spyOn(
          mockTimeOffRequestService,
          'refuseTimeOffRequestByAdminOrAssistant',
        )
        .mockResolvedValue(timeOffRequestAfterRefuse);

      const result =
        await adminTimeOffRequestController.refuseTimeOffRequestByAdminOrAssistant(
          timeOffRequest.id,
          updateTimeOffRequestDto,
        );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(RequestStatusType.REFUSED);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(
        mockTimeOffRequestService.refuseTimeOffRequestByAdminOrAssistant,
      ).toBeCalled();
    });
  });
});
