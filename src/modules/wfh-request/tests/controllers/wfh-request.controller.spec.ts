import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import * as fileValidator from '../../../../validators/file.validator';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { WfhRequestController } from '../../controllers/wfh-request.controller';
import { WfhRequestService } from '../../services/wfh-request.service';
import { WfhRequestFake } from '../fakes/wfh-request.fake';

describe('WfhRequestController', () => {
  let wfhRequestController: WfhRequestController;

  const pageOptions = WfhRequestFake.buildWfhRequestsPageOptionsDto();
  const wfhRequestDtos = WfhRequestFake.buildWfhRequestPageDto();
  const wfhRequest = WfhRequestFake.buildWfhRequestDto();
  const userLogin = UserFake.buildUserDto();
  const userEntity = {
    id: userLogin.id,
    permissions: userLogin.roles,
    toDto: jest.fn(() => userEntity) as unknown,
  } as unknown as UserEntity;

  const mockWfhRequestService = {
    getAllWfhRequests: jest.fn(),
    createWfhRequest: jest.fn(),
    deleteWfhRequest: jest.fn(),
    getWfhRequestDetails: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WfhRequestController],
      providers: [
        {
          provide: WfhRequestService,
          useValue: mockWfhRequestService,
        },
        {
          provide: AwsS3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    wfhRequestController =
      module.get<WfhRequestController>(WfhRequestController);
  });

  describe('getWfhRequestByUserId', () => {
    it('should return current user login list wfh requests', async () => {
      jest
        .spyOn(mockWfhRequestService, 'getAllWfhRequests')
        .mockReturnValue(wfhRequestDtos);

      const result = await wfhRequestController.getWfhRequestByUserId(
        userEntity,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(wfhRequestDtos.data[0].id);
      expect(result.data[0].dateType).toEqual(wfhRequestDtos.data[0].dateType);
      expect(result.data[0].details).toEqual(wfhRequestDtos.data[0].details);

      expect(mockWfhRequestService.getAllWfhRequests).toBeCalled();
    });
  });

  describe('createWfhRequest', () => {
    const createWfhRequestDto = WfhRequestFake.buildCreateWfhRequestDto();

    it('should create wfh request', async () => {
      jest
        .spyOn(mockWfhRequestService, 'createWfhRequest')
        .mockResolvedValue(wfhRequest);

      const result = await wfhRequestController.createWfhRequest(
        createWfhRequestDto,
        userEntity,
      );

      expect(result.id).toEqual(wfhRequest.id);
      expect(result.dateType).toEqual(wfhRequest.dateType);
      expect(result.details).toEqual(wfhRequest.details);

      expect(mockWfhRequestService.createWfhRequest).toBeCalled();
    });
  });

  describe('deleteWfhRequest', () => {
    it('should delete wfh request', async () => {
      jest.spyOn(mockWfhRequestService, 'deleteWfhRequest');

      await wfhRequestController.deleteWfhRequest(userEntity, wfhRequest.id);

      expect(mockWfhRequestService.deleteWfhRequest).toBeCalledWith(
        userLogin.id,
        wfhRequest.id,
      );
    });
  });

  describe('uploadFile', () => {
    const expectedPhotoUrl = 'https://s3/wfh_request_attach_file/test.jpeg';
    const wfhRequestFile = WfhRequestFake.buildWfhRequestIFile();

    it('should user upload file for wfh request', async () => {
      jest.spyOn(fileValidator, 'validateFileType');
      jest.spyOn(mockS3Service, 'uploadFile').mockReturnValue(expectedPhotoUrl);

      const result = await wfhRequestController.uploadFile(
        userEntity,
        wfhRequestFile,
      );

      expect(result.s3Path).toEqual(expectedPhotoUrl);

      expect(fileValidator.validateFileType).toBeCalled();
      expect(mockS3Service.uploadFile).toBeCalled();
    });
  });

  describe('getWfhRequestDetails', () => {
    it('should return wfh request details by id', async () => {
      jest
        .spyOn(mockWfhRequestService, 'getWfhRequestDetails')
        .mockReturnValue(wfhRequest);

      const result = await wfhRequestController.getWfhRequestDetails(
        userEntity,
        wfhRequest.id,
      );

      expect(result.id).toEqual(wfhRequest.id);
      expect(result.status).toEqual(wfhRequest.status);
      expect(result.dateType).toEqual(wfhRequest.dateType);
      expect(result.details).toEqual(wfhRequest.details);

      expect(mockWfhRequestService.getWfhRequestDetails).toBeCalled();
    });
  });
});
