import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import * as fileValidator from '../../../../validators/file.validator';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { TimeOffRequestController } from '../../controllers/time-off-request.controller';
import { TimeOffRequestService } from '../../services/time-off-request.service';
import { TimeOffRequestFake } from '../fakes/time-off-request.fake';

describe('TimeOffRequestController', () => {
  let timeOffRequestController: TimeOffRequestController;

  const pageOptions = TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
  const expectedTimeOffRequestDtos =
    TimeOffRequestFake.buildTimeOffRequestPageDto();
  const timeOffRequest = TimeOffRequestFake.buildTimeOffRequestDto();
  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);

  const mockTimeOffRequestService = {
    getTimeOffRequests: jest.fn(),
    getAllCollaborators: jest.fn(),
    getTimeOffRequestDetails: jest.fn(),
    createTimeOffRequest: jest.fn(),
    deleteTimeOffRequest: jest.fn(),
    getAccruedBalance: jest.fn(),
  };

  const mockAwsS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffRequestController],
      providers: [
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
      ],
    }).compile();

    timeOffRequestController = module.get<TimeOffRequestController>(
      TimeOffRequestController,
    );
  });

  describe('getTimeOffRequests', () => {
    it('should return a page of time-off requests', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'getTimeOffRequests')
        .mockReturnValue(expectedTimeOffRequestDtos);

      const result = await timeOffRequestController.getTimeOffRequests(
        userEntity,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(expectedTimeOffRequestDtos.data[0].id);
      expect(result.data[0].user).toEqual(
        expectedTimeOffRequestDtos.data[0].user,
      );
      expect(result.data[0].collaborator).toEqual(
        expectedTimeOffRequestDtos.data[0].collaborator,
      );

      expect(mockTimeOffRequestService.getTimeOffRequests).toBeCalled();
    });
  });

  describe('getUserAccruedBalance', () => {
    it('should return accrued balance of user', async () => {
      const accruedBalance = 1;

      jest
        .spyOn(mockTimeOffRequestService, 'getAccruedBalance')
        .mockReturnValue(accruedBalance);

      const result =
        await timeOffRequestController.getUserAccruedBalance(userEntity);

      expect(result).toEqual(accruedBalance);

      expect(mockTimeOffRequestService.getAccruedBalance).toBeCalled();
    });
  });

  describe('uploadFile', () => {
    const expectedFileUrl = 'https://s3/time_off_request_attach_file/test.jpeg';
    const timeOffRequestFile = TimeOffRequestFake.buildTimeOffRequestIFile();

    it('should user upload file for time-off request', async () => {
      jest.spyOn(fileValidator, 'validateFileType');
      jest
        .spyOn(mockAwsS3Service, 'uploadFile')
        .mockReturnValue(expectedFileUrl);

      const result = await timeOffRequestController.uploadFile(
        userEntity,
        timeOffRequestFile,
      );

      expect(result.s3Path).toEqual(expectedFileUrl);

      expect(fileValidator.validateFileType).toBeCalled();
      expect(mockAwsS3Service.uploadFile).toBeCalled();
    });
  });

  describe('getTimeOffRequestDetails', () => {
    it('should return time-off request details by id', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'getTimeOffRequestDetails')
        .mockReturnValue(timeOffRequest);

      const result = await timeOffRequestController.getTimeOffRequestDetails(
        timeOffRequest.id,
        userEntity,
      );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.status).toEqual(timeOffRequest.status);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.getTimeOffRequestDetails).toBeCalled();
    });
  });

  describe('createTimeOffRequest', () => {
    const createTimeOffRequestDto =
      TimeOffRequestFake.buildCreateTimeOffRequestDto();

    it('should create tim-off request', async () => {
      jest
        .spyOn(mockTimeOffRequestService, 'createTimeOffRequest')
        .mockResolvedValue(timeOffRequest);

      const result = await timeOffRequestController.createTimeOffRequest(
        userEntity,
        createTimeOffRequestDto,
      );

      expect(result.id).toEqual(timeOffRequest.id);
      expect(result.dateType).toEqual(timeOffRequest.dateType);
      expect(result.details).toEqual(timeOffRequest.details);

      expect(mockTimeOffRequestService.createTimeOffRequest).toBeCalled();
    });
  });

  describe('deleteTimeOffRequest', () => {
    it('should delete time-off request by id', async () => {
      jest.spyOn(mockTimeOffRequestService, 'deleteTimeOffRequest');

      await timeOffRequestController.deleteTimeOffRequest(
        userEntity,
        timeOffRequest.id,
      );

      expect(mockTimeOffRequestService.deleteTimeOffRequest).toBeCalledWith(
        userLogin.id,
        timeOffRequest.id,
      );
    });
  });
});
