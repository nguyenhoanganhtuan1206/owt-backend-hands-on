/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { WfhRequestEntity } from '../../entities/wfh-request.entity';
import WfhRequestMapper from '../../mapper/wfh-request.mapper';
import { WfhRequestService } from '../../services/wfh-request.service';
import WfhRequestValidator from '../../validators/wfh-request.validator';
import { WfhRequestFake } from '../fakes/wfh-request.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('WfhRequestService', () => {
  let wfhRequestService: WfhRequestService;
  let wfhRequestRepository: Repository<WfhRequestEntity>;

  const pageOptions = WfhRequestFake.buildWfhRequestsPageOptionsDto();
  const wfhRequestDtos = WfhRequestFake.buildWfhRequestPageDto();
  const wfhRequest = WfhRequestFake.buildWfhRequestDto();
  const wfhRequestEntity = WfhRequestFake.buildWfhRequestEntity(wfhRequest);
  const wfhAttachFile = 'https://s3/wfh_request_attach_file/test.jpeg';
  const userLogin = UserFake.buildUserDto();

  wfhRequestEntity.attachedFile = wfhAttachFile;

  const mockWfhRequestMapper = {
    toWfhRequestEntity: jest.fn(),
  };

  const mockS3Service = {
    deleteFile: jest.fn(),
  };

  const mockWfhRequestValidator = {
    validateWfhRequestDate: jest.fn(),
    validateWfhRequestTotalDays: jest.fn(),
    validateWfhRequestIsPending: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WfhRequestService,
        {
          provide: WfhRequestMapper,
          useValue: mockWfhRequestMapper,
        },
        {
          provide: AwsS3Service,
          useValue: mockS3Service,
        },
        {
          provide: WfhRequestValidator,
          useValue: mockWfhRequestValidator,
        },
        {
          provide: getRepositoryToken(WfhRequestEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    wfhRequestService = module.get<WfhRequestService>(WfhRequestService);
    wfhRequestRepository = module.get<Repository<WfhRequestEntity>>(
      getRepositoryToken(WfhRequestEntity),
    );
  });

  describe('getAllWfhRequests', () => {
    it('should be return all wfh requests', async () => {
      const wfhRequestEntities = [wfhRequestEntity];

      jest.spyOn(wfhRequestRepository, 'createQueryBuilder').mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        paginate: jest
          .fn()
          .mockResolvedValue([wfhRequestEntities, wfhRequestDtos.meta]),
      } as never);
      jest
        .spyOn(wfhRequestEntities, 'toPageDto')
        .mockReturnValue(wfhRequestDtos);

      const result = await wfhRequestService.getAllWfhRequests(pageOptions);

      expect(result).toEqual(wfhRequestDtos);

      expect(wfhRequestRepository.createQueryBuilder).toBeCalled();
      expect(wfhRequestEntities.toPageDto).toBeCalled();
    });
  });

  describe('approveWfhRequest', () => {
    it('should update status approve to wfh request', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOneBy')
        .mockResolvedValue(wfhRequestEntity);
      jest
        .spyOn(wfhRequestRepository, 'save')
        .mockResolvedValue(wfhRequestEntity);

      const result = await wfhRequestService.approveWfhRequest(wfhRequest.id);

      expect(result).toEqual(wfhRequest);

      expect(wfhRequestRepository.findOneBy).toBeCalledWith({
        id: wfhRequest.id,
      });
      expect(wfhRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if wfh request not found', async () => {
      jest.spyOn(wfhRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        wfhRequestService.approveWfhRequest(wfhRequest.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(wfhRequestRepository.findOneBy).toBeCalledWith({
        id: wfhRequest.id,
      });
    });
  });

  describe('refuseWfhRequest', () => {
    it('should update status refused to wfh request', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOneBy')
        .mockResolvedValue(wfhRequestEntity);
      jest
        .spyOn(wfhRequestRepository, 'save')
        .mockResolvedValue(wfhRequestEntity);

      const result = await wfhRequestService.refuseWfhRequest(wfhRequest.id);

      expect(result).toEqual(wfhRequest);

      expect(wfhRequestRepository.findOneBy).toBeCalledWith({
        id: wfhRequest.id,
      });
      expect(wfhRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if wfh request not found', async () => {
      jest.spyOn(wfhRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        wfhRequestService.refuseWfhRequest(wfhRequest.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(wfhRequestRepository.findOneBy).toBeCalledWith({
        id: wfhRequest.id,
      });
    });
  });

  describe('createWfhRequest', () => {
    const createWfhRequest = WfhRequestFake.buildCreateWfhRequestDto();

    it('should create new wfh request', async () => {
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestDate');
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestTotalDays');
      jest
        .spyOn(mockWfhRequestMapper, 'toWfhRequestEntity')
        .mockImplementation(() => Promise.resolve(wfhRequestEntity));
      jest
        .spyOn(wfhRequestRepository, 'save')
        .mockImplementation(() => Promise.resolve(wfhRequestEntity));

      const result = await wfhRequestService.createWfhRequest(
        userLogin.id,
        createWfhRequest,
      );

      expect(result).toEqual(wfhRequest);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
      expect(mockWfhRequestValidator.validateWfhRequestTotalDays).toBeCalled();
      expect(mockWfhRequestMapper.toWfhRequestEntity).toBeCalled();
      expect(wfhRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if create wfh request user not found', async () => {
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestDate');
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestTotalDays');
      jest
        .spyOn(mockWfhRequestMapper, 'toWfhRequestEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        wfhRequestService.createWfhRequest(userLogin.id, createWfhRequest),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
      expect(mockWfhRequestValidator.validateWfhRequestTotalDays).toBeCalled();
      expect(mockWfhRequestMapper.toWfhRequestEntity).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create wfh request with date to before date from', async () => {
      const requestDate = new Date();
      const createWfhRequestError = {
        ...createWfhRequest,
        dateFrom: requestDate,
        dateTo: new Date(requestDate.getTime() - 24 * 60 * 60 * 1000),
      };

      jest
        .spyOn(mockWfhRequestValidator, 'validateWfhRequestDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.DATE_TO_BEFORE_DATE_FROM,
          );
        });

      await expect(
        wfhRequestService.createWfhRequest(userLogin.id, createWfhRequestError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create wfh request date type incorrect', async () => {
      const createWfhRequestError = {
        ...createWfhRequest,
        dateType: 'HALF_DAY',
      };

      jest
        .spyOn(mockWfhRequestValidator, 'validateWfhRequestDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
          );
        });

      await expect(
        wfhRequestService.createWfhRequest(userLogin.id, createWfhRequestError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create wfh request with date to before date from', async () => {
      const requestDate = new Date();
      const createWfhRequestError = {
        ...createWfhRequest,
        dateFrom: requestDate,
        dateTo: new Date(requestDate.getTime() - 24 * 60 * 60 * 1000),
      };

      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestDate');
      jest
        .spyOn(mockWfhRequestValidator, 'validateWfhRequestTotalDays')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.DATE_TO_BEFORE_DATE_FROM,
          );
        });

      await expect(
        wfhRequestService.createWfhRequest(userLogin.id, createWfhRequestError),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
      expect(mockWfhRequestValidator.validateWfhRequestTotalDays).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create wfh request with total date incorrect', async () => {
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestDate');
      jest
        .spyOn(mockWfhRequestValidator, 'validateWfhRequestTotalDays')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TOTAL_DAYS_OF_REQUEST_IS_NOT_CORRECT,
          );
        });

      await expect(
        wfhRequestService.createWfhRequest(userLogin.id, createWfhRequest),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockWfhRequestValidator.validateWfhRequestDate).toBeCalled();
      expect(mockWfhRequestValidator.validateWfhRequestTotalDays).toBeCalled();
    });
  });

  describe('deleteWfhRequest', () => {
    it('should delete wfh request', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(wfhRequestEntity));
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestIsPending');
      jest.spyOn(mockS3Service, 'deleteFile');
      jest
        .spyOn(wfhRequestRepository, 'remove')
        .mockImplementationOnce(() => Promise.resolve(wfhRequestEntity));

      await wfhRequestService.deleteWfhRequest(userLogin.id, wfhRequest.id);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
      expect(mockWfhRequestValidator.validateWfhRequestIsPending).toBeCalled();
      expect(mockS3Service.deleteFile).toBeCalled();
      expect(wfhRequestRepository.remove).toBeCalled();
    });

    it('should throw InvalidNotFoundException if wfh request not found', async () => {
      jest.spyOn(wfhRequestRepository, 'findOne').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.WFH_REQUEST_NOT_FOUND);
      });

      await expect(
        wfhRequestService.deleteWfhRequest(userLogin.id, wfhRequest.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
    });

    it('should throw InvalidBadRequestException if wfh request status not is pending', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(wfhRequestEntity));
      jest
        .spyOn(mockWfhRequestValidator, 'validateWfhRequestIsPending')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
          );
        });

      await expect(
        wfhRequestService.deleteWfhRequest(userLogin.id, wfhRequest.id),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
      expect(mockWfhRequestValidator.validateWfhRequestIsPending).toBeCalled();
    });

    it('should throw InvalidBadRequestException if cannot delete attach file when delete wfh request', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(wfhRequestEntity));
      jest.spyOn(mockWfhRequestValidator, 'validateWfhRequestIsPending');
      jest.spyOn(mockS3Service, 'deleteFile').mockImplementationOnce(() => {
        throw new InvalidBadRequestException(ErrorCode.ERROR_DELETE_FILE);
      });

      await expect(
        wfhRequestService.deleteWfhRequest(userLogin.id, wfhRequest.id),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
      expect(mockWfhRequestValidator.validateWfhRequestIsPending).toBeCalled();
      expect(mockS3Service.deleteFile).toBeCalled();
    });
  });

  describe('getWfhRequestDetails', () => {
    it('should get details wfh request of user', async () => {
      jest
        .spyOn(wfhRequestRepository, 'findOne')
        .mockResolvedValue(wfhRequestEntity);

      const result = await wfhRequestService.getWfhRequestDetails(
        wfhRequest.id,
        wfhRequest.user.id,
      );

      expect(result).toEqual(wfhRequest);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
    });

    it('should throw InvalidNotFoundException if wfh request not found', async () => {
      jest.spyOn(wfhRequestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        wfhRequestService.getWfhRequestDetails(
          wfhRequest.id,
          wfhRequest.user.id,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(wfhRequestRepository.findOne).toBeCalledWith({
        where: {
          id: wfhRequest.id,
          user: {
            id: wfhRequest.user.id,
          },
        },
      });
    });
  });

  describe('getPendingWfhRequestsCount', () => {
    it('should be return total pending wfh request', async () => {
      jest.spyOn(wfhRequestRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      } as never);

      const result = await wfhRequestService.getPendingWfhRequestsCount();

      expect(result).toEqual(1);

      expect(wfhRequestRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getPendingWfhRequestsCountForUser', () => {
    it('should be return total pending wfh request for user', async () => {
      jest.spyOn(wfhRequestRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      } as never);

      const result = await wfhRequestService.getPendingWfhRequestsCountForUser(
        userLogin.id,
      );

      expect(result).toEqual(1);

      expect(wfhRequestRepository.createQueryBuilder).toBeCalled();
    });
  });
});
