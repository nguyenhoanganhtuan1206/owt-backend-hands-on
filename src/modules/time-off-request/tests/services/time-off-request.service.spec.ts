/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { UnauthorizedException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RequestStatusType } from '../../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../../exceptions';
import MailService from '../../../../integrations/mail/mail.service';
import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import type { ExternalUserAccessDto } from '../../../auth/dto/ExternalUserAccessDto';
import { AuthService } from '../../../auth/services/auth.service';
import { TimeOffCollaboratorService } from '../../../time-off-collaborator/services/time-off-collaborator.service';
import type { UserEntity } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { VacationBalanceFake } from '../../../vacation-balance/tests/fakes/vacation-balance.fake';
import { TimeOffRequestEntity } from '../../entities/time-off-request.entity';
import TimeOffRequestMapper from '../../mapper/time-off-request.mapper';
import { TimeOffRequestService } from '../../services/time-off-request.service';
import TimeOffRequestValidator from '../../validators/time-off-request.validator';
import { TimeOffRequestFake } from '../fakes/time-off-request.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('TimeOffRequestService', () => {
  let timeOffRequestService: TimeOffRequestService;
  let timeOffRequestRepository: Repository<TimeOffRequestEntity>;

  const pageOptions = TimeOffRequestFake.buildTimeOffRequestsPageOptionsDto();
  const timeOffRequestDtos = TimeOffRequestFake.buildTimeOffRequestPageDto();
  const externalUserAccess = TimeOffRequestFake.buildExternalUserAccessDto();
  const timeOffRequest = TimeOffRequestFake.buildTimeOffRequestDto();
  const approvedTimeOffRequest = {
    ...TimeOffRequestFake.buildTimeOffRequestDto(),
    status: RequestStatusType.APPROVED,
  };
  const timeOffRequestEntity =
    TimeOffRequestFake.buildTimeOffRequestEntity(timeOffRequest);
  const timeOffRequestEntities = [timeOffRequestEntity];
  const approvedTimeOffRequestEntity =
    TimeOffRequestFake.buildTimeOffRequestEntity(approvedTimeOffRequest);
  const approvedTimeOffRequestEntities = [approvedTimeOffRequestEntity];
  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);

  const mockTimeOffRequestMapper = {
    toTimeOffRequestEntity: jest.fn(),
    toTimeOffRequestEntityToUpdate: jest.fn(),
  };

  const mockTimeOffRequestValidator = {
    validateTimeOffRequestDate: jest.fn(),
    validateHoursAndDateType: jest.fn(),
    validateTimeOffRequestTotalDays: jest.fn(),
    validateTimeOffRequestIsPending: jest.fn(),
    validateTimeOffRequestStatus: jest.fn(),
  };

  const mockUserService = {
    findUserByCompanyEmail: jest.fn(),
    findUserById: jest.fn(),
  };

  const mockMailService = {
    send: jest.fn(),
  };

  const mockAuthService = {
    decodeToken: jest.fn(),
    createExternalUserAccessTokenToPM: jest.fn(),
  };

  const mockAwsS3Service = {
    deleteFile: jest.fn(),
  };

  const mockTimeOffCollaboratorService = {
    getCollaboratorQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffRequestService,
        {
          provide: TimeOffRequestMapper,
          useValue: mockTimeOffRequestMapper,
        },
        {
          provide: TimeOffRequestValidator,
          useValue: mockTimeOffRequestValidator,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: getRepositoryToken(TimeOffRequestEntity),
          useClass: Repository,
        },
        {
          provide: TimeOffCollaboratorService,
          useValue: mockTimeOffCollaboratorService,
        },
      ],
    }).compile();

    timeOffRequestService = module.get<TimeOffRequestService>(
      TimeOffRequestService,
    );
    timeOffRequestRepository = module.get<Repository<TimeOffRequestEntity>>(
      getRepositoryToken(TimeOffRequestEntity),
    );
  });

  describe('getAllTimeOffRequests', () => {
    it('should be return all time off requests', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'createQueryBuilder')
        .mockReturnValue({
          addSelect: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockResolvedValue([
              timeOffRequestEntities,
              timeOffRequestDtos.meta,
            ]),
        } as never);
      jest
        .spyOn(timeOffRequestEntities, 'toPageDto')
        .mockReturnValue(timeOffRequestDtos);

      const result =
        await timeOffRequestService.getAllTimeOffRequests(pageOptions);

      expect(result).toEqual(timeOffRequestDtos);

      expect(timeOffRequestRepository.createQueryBuilder).toBeCalled();
      expect(timeOffRequestEntities.toPageDto).toBeCalled();
    });
  });

  describe('getTimeOffRequests', () => {
    it('should list time-off requests by userId', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockImplementation(() => Promise.resolve(userEntity));
      jest
        .spyOn(timeOffRequestRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          addSelect: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          paginate: jest
            .fn()
            .mockResolvedValueOnce([
              timeOffRequestEntities,
              timeOffRequestDtos.meta,
            ]),
        } as never)
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest
                .fn()
                .mockResolvedValueOnce(approvedTimeOffRequestEntities),
            }) as never,
        );
      jest
        .spyOn(timeOffRequestEntities, 'toPageDto')
        .mockReturnValue(timeOffRequestDtos);

      const result = await timeOffRequestService.getTimeOffRequests(
        userLogin.id,
        pageOptions,
      );

      expect(result).toEqual(timeOffRequestDtos);

      expect(mockUserService.findUserById).toBeCalledWith(userEntity.id);
      expect(timeOffRequestRepository.createQueryBuilder).toBeCalled();
      expect(timeOffRequestEntities.toPageDto).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
      });

      await expect(
        timeOffRequestService.getTimeOffRequests(userLogin.id, pageOptions),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockUserService.findUserById).toBeCalledWith(userEntity.id);
    });
  });

  describe('getAccruedBalance', () => {
    it('should return accrued balance of employee joined for more than 1 year', async () => {
      const startDateOneYearAgo = new Date();
      startDateOneYearAgo.setFullYear(startDateOneYearAgo.getFullYear() - 1);
      const employee = {
        ...userEntity,
        startDate: startDateOneYearAgo,
        yearlyAllowance: 20,
      } as UserEntity;

      const timeOffRequestEntityBalance = {
        ...timeOffRequestEntity,
        totalDays: 3,
      } as TimeOffRequestEntity;

      jest.spyOn(mockUserService, 'findUserById').mockResolvedValue(employee);
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockResolvedValue(timeOffRequestEntityBalance);

      const expected = UserFake.calculateUserAccruedBalance(employee, 3);

      const result = await timeOffRequestService.getAccruedBalance(employee.id);

      expect(result).toEqual(expected);

      expect(mockUserService.findUserById).toBeCalled();
    });

    it('should return accrued balance of employee joined in year', async () => {
      const employee = {
        ...userEntity,
        startDate: new Date(),
        yearlyAllowance: 15,
      } as UserEntity;

      const timeOffRequestEntityBalance = {
        ...timeOffRequestEntity,
        totalDays: 0,
      } as TimeOffRequestEntity;

      jest.spyOn(mockUserService, 'findUserById').mockResolvedValue(employee);
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockResolvedValue(timeOffRequestEntityBalance);

      const expected = UserFake.calculateUserAccruedBalance(employee, 0);

      const result = await timeOffRequestService.getAccruedBalance(employee.id);

      expect(result).toEqual(expected);

      expect(mockUserService.findUserById).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user not found', async () => {
      jest.spyOn(mockUserService, 'findUserById').mockImplementationOnce(() => {
        throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
      });

      await expect(
        timeOffRequestService.getAccruedBalance(userEntity.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockUserService.findUserById).toBeCalled();
    });
  });

  describe('getTimeOffRequestDetailsByPM', () => {
    it('should get details time off request by PM', async () => {
      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValue(timeOffRequestEntity);

      const result =
        await timeOffRequestService.getTimeOffRequestDetailsByPM('token');

      expect(result).toEqual(timeOffRequest);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(mockAuthService.decodeToken).toBeCalled();
    });

    it('should throw UnauthorizedException if invalid or missing authentication token', async () => {
      await expect(
        timeOffRequestService.getTimeOffRequestDetailsByPM('token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.decodeToken).toBeCalled();
    });

    it('should throw InvalidNotFoundException if request time off request not found', async () => {
      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest.spyOn(timeOffRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        timeOffRequestService.getTimeOffRequestDetailsByPM('token'),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });
  });

  describe('getTimeOffRequestDetails', () => {
    const allowance = VacationBalanceFake.buildAllowanceDto();

    it('should get details time off request of user', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValue(timeOffRequestEntity);
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockResolvedValue(timeOffRequestEntity);
      jest
        .spyOn(timeOffRequestRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockImplementation(() => Promise.resolve([allowance])),
        } as never);

      const result = await timeOffRequestService.getTimeOffRequestDetails(
        timeOffRequest.id,
        timeOffRequestEntity.user.id,
      );

      expect(result).toEqual(timeOffRequest);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
    });

    it('should throw InvalidNotFoundException if user request time off request not found', async () => {
      jest.spyOn(timeOffRequestRepository, 'findOneBy').mockResolvedValue(null);

      await expect(
        timeOffRequestService.getTimeOffRequestDetails(timeOffRequest.id),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidNotFoundException if admin request time off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValue(timeOffRequestEntity);
      jest.spyOn(timeOffRequestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        timeOffRequestService.getTimeOffRequestDetails(
          timeOffRequest.id,
          timeOffRequestEntity.user.id,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
    });
  });

  describe('createTimeOffRequest', () => {
    const createTimeOffRequest =
      TimeOffRequestFake.buildCreateTimeOffRequestDto();

    it('should create new time-off request', async () => {
      jest.spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestDate');
      jest.spyOn(
        mockTimeOffRequestValidator,
        'validateTimeOffRequestTotalDays',
      );
      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntity')
        .mockImplementation(() => Promise.resolve(timeOffRequestEntity));
      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementation(() => Promise.resolve(timeOffRequestEntity));

      const result = await timeOffRequestService.createTimeOffRequest(
        userEntity,
        createTimeOffRequest,
      );

      expect(result.id).toEqual(timeOffRequestEntity.id);
      expect(result.dateType).toEqual(timeOffRequestEntity.dateType);
      expect(result.details).toEqual(timeOffRequestEntity.details);
      expect(result.collaborator).toEqual(timeOffRequestEntity.collaborator);
      expect(result.status).toEqual(timeOffRequestEntity.status);

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestDate,
      ).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestTotalDays,
      ).toBeCalled();
      expect(mockTimeOffRequestMapper.toTimeOffRequestEntity).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if create time-off request user not found', async () => {
      jest.spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestDate');
      jest.spyOn(
        mockTimeOffRequestValidator,
        'validateTimeOffRequestTotalDays',
      );
      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
        });

      await expect(
        timeOffRequestService.createTimeOffRequest(
          userEntity,
          createTimeOffRequest,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestDate,
      ).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestTotalDays,
      ).toBeCalled();
      expect(mockTimeOffRequestMapper.toTimeOffRequestEntity).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create time-off request with date to before date from', async () => {
      const requestDate = new Date();
      const createTimeOffRequestError = {
        ...createTimeOffRequest,
        dateFrom: requestDate,
        dateTo: new Date(requestDate.getTime() - 24 * 60 * 60 * 1000),
      };

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.DATE_TO_BEFORE_DATE_FROM,
          );
        });

      await expect(
        timeOffRequestService.createTimeOffRequest(
          userEntity,
          createTimeOffRequestError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestDate,
      ).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create tim-off request date type incorrect', async () => {
      const createTimeOffRequestError = {
        ...createTimeOffRequest,
        dateType: 'HALF_DAY',
      };

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestDate')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
          );
        });

      await expect(
        timeOffRequestService.createTimeOffRequest(
          userEntity,
          createTimeOffRequestError,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestDate,
      ).toBeCalled();
    });

    it('should throw InvalidBadRequestException if create time-off request with total date incorrect', async () => {
      jest.spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestDate');
      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestTotalDays')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TOTAL_DAYS_OF_REQUEST_IS_NOT_CORRECT,
          );
        });

      await expect(
        timeOffRequestService.createTimeOffRequest(
          userEntity,
          createTimeOffRequest,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestDate,
      ).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestTotalDays,
      ).toBeCalled();
    });
  });

  describe('deleteTimeOffRequest', () => {
    it('should delete time-off request', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(timeOffRequestEntity));
      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestIsPending')
        .mockReturnValueOnce(null);
      jest.spyOn(mockAwsS3Service, 'deleteFile').mockReturnValueOnce(null);
      jest
        .spyOn(timeOffRequestRepository, 'remove')
        .mockImplementationOnce(() => Promise.resolve(timeOffRequestEntity));

      await timeOffRequestService.deleteTimeOffRequest(
        userLogin.id,
        timeOffRequest.id,
      );

      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestIsPending,
      ).toBeCalled();
      expect(mockAwsS3Service.deleteFile).toBeCalled();
      expect(timeOffRequestRepository.remove).toBeCalled();
      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
    });

    it('should throw InvalidNotFoundException if time-off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(
            ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
          );
        });

      await expect(
        timeOffRequestService.deleteTimeOffRequest(
          userLogin.id,
          timeOffRequest.id,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
    });

    it('should throw InvalidBadRequestException if time-off request status not is pending', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(timeOffRequestEntity));
      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestIsPending')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.TIME_OFF_REQUEST_NOT_EXISTED,
          );
        });

      await expect(
        timeOffRequestService.deleteTimeOffRequest(
          userLogin.id,
          timeOffRequest.id,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestIsPending,
      ).toBeCalled();
    });

    it('should throw InvalidBadRequestException if cannot delete attach file when delete time-off request', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(timeOffRequestEntity));
      jest.spyOn(
        mockTimeOffRequestValidator,
        'validateTimeOffRequestIsPending',
      );
      jest.spyOn(mockAwsS3Service, 'deleteFile').mockImplementationOnce(() => {
        throw new InvalidBadRequestException(ErrorCode.ERROR_DELETE_FILE);
      });

      await expect(
        timeOffRequestService.deleteTimeOffRequest(
          userLogin.id,
          timeOffRequest.id,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOne).toBeCalledWith({
        where: {
          id: timeOffRequest.id,
          user: {
            id: timeOffRequest.user.id,
          },
        },
      });
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestIsPending,
      ).toBeCalled();
      expect(mockAwsS3Service.deleteFile).toBeCalled();
    });
  });

  describe('approveTimeOffRequestByPM', () => {
    jest
      .spyOn(mockAuthService, 'createExternalUserAccessTokenToPM')
      .mockResolvedValueOnce('externalUserAccessToken');

    const externalUserAccessDto: ExternalUserAccessDto = {
      ...externalUserAccess,
      accessToken: 'externalUserAccessToken',
    };

    it('should approve time-off request by PM successfully', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.APPROVED,
        );

      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual = await timeOffRequestService.approveTimeOffRequestByPM(
        externalUserAccessDto,
      );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.APPROVED);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.approveTimeOffRequestByPM(externalUserAccessDto),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.APPROVED;

      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(async () =>
        timeOffRequestService.approveTimeOffRequestByPM(externalUserAccessDto),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });
  });

  describe('refuseTimeOffRequestByPM', () => {
    jest
      .spyOn(mockAuthService, 'createExternalUserAccessTokenToPM')
      .mockResolvedValueOnce('externalUserAccessToken');

    const externalUserAccessDto: ExternalUserAccessDto = {
      ...externalUserAccess,
      accessToken: 'externalUserAccessToken',
    };

    it('should refuse time-off request by PM successfully', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.REFUSED,
        );

      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual = await timeOffRequestService.refuseTimeOffRequestByPM(
        externalUserAccessDto,
      );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.REFUSED);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.refuseTimeOffRequestByPM(externalUserAccessDto),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.REFUSED;

      jest.spyOn(mockAuthService, 'decodeToken').mockResolvedValueOnce('token');

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(async () =>
        timeOffRequestService.refuseTimeOffRequestByPM(externalUserAccessDto),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(mockAuthService.decodeToken).toBeCalled();
      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });
  });

  describe('approveTimeOffRequestByAdminOrAssistant', () => {
    const updateTimeOffRequestDto =
      TimeOffRequestFake.buildUpdateTimeOffRequestDto();

    it('should approve time-off request by Admin or Assistant successfully', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.APPROVED,
        );

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual =
        await timeOffRequestService.approveTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.APPROVED);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.approveTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.APPROVED;

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(
        timeOffRequestService.approveTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });
  });

  describe('refuseTimeOffRequestByAdminOrAssistant', () => {
    const updateTimeOffRequestDto =
      TimeOffRequestFake.buildUpdateTimeOffRequestDto();

    it('should refuse time-off request by Admin or Assistant successfully', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.REFUSED,
        );

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual =
        await timeOffRequestService.approveTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.REFUSED);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.refuseTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.REFUSED;

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(
        timeOffRequestService.refuseTimeOffRequestByAdminOrAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });
  });

  describe('sendEmailToPM', () => {
    const updateTimeOffRequestDto =
      TimeOffRequestFake.buildUpdateTimeOffRequestDto();

    it('should send email confirm time-off request to Project Manager', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.PROCESSING,
        );
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest
        .spyOn(mockAuthService, 'createExternalUserAccessTokenToPM')
        .mockResolvedValueOnce('token');

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual = await timeOffRequestService.sendEmailToPM(
        timeOffRequestEntity.id,
        updateTimeOffRequestDto,
      );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.PROCESSING);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestMapper.toTimeOffRequestEntityToUpdate,
      ).toBeCalled();
      expect(mockAuthService.createExternalUserAccessTokenToPM).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.sendEmailToPM(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.APPROVED;

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(
        timeOffRequestService.sendEmailToPM(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });

    it('should throw InvalidBadRequestException when collaborator is empty', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.PROCESSING,
        );
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest
        .spyOn(mockAuthService, 'createExternalUserAccessTokenToPM')
        .mockResolvedValueOnce('token');

      timeOffRequestEntity.collaborator = null;

      await expect(
        timeOffRequestService.sendEmailToPM(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestMapper.toTimeOffRequestEntityToUpdate,
      ).toBeCalled();
      expect(mockAuthService.createExternalUserAccessTokenToPM).toBeCalled();
    });
  });

  describe('sendEmailToAssistant', () => {
    const updateTimeOffRequestDto =
      TimeOffRequestFake.buildUpdateTimeOffRequestDto();

    it('should send email confirm time-off request to Assistant', async () => {
      const timeOffRequestAfterUpdate =
        TimeOffRequestFake.buildTimeOffRequestEntityAfterUpdate(
          timeOffRequest,
          RequestStatusType.ASSISTANT,
        );
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockUserService, 'findUserByCompanyEmail')
        .mockResolvedValueOnce(timeOffRequestEntity.user);

      jest
        .spyOn(timeOffRequestRepository, 'save')
        .mockImplementationOnce(() =>
          Promise.resolve(timeOffRequestAfterUpdate),
        );

      jest.spyOn(mockMailService, 'send').mockImplementationOnce(jest.fn());

      const actual = await timeOffRequestService.sendEmailToAssistant(
        timeOffRequestEntity.id,
        updateTimeOffRequestDto,
      );

      expect(actual.id).toEqual(timeOffRequestAfterUpdate.id);
      expect(actual.user).toEqual(timeOffRequestAfterUpdate.user);
      expect(actual.status).toEqual(RequestStatusType.ASSISTANT);
      expect(actual.details).toEqual(timeOffRequestAfterUpdate.details);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(timeOffRequestRepository.save).toBeCalled();
      expect(
        mockTimeOffRequestMapper.toTimeOffRequestEntityToUpdate,
      ).toBeCalled();
      expect(mockAuthService.createExternalUserAccessTokenToPM).toBeCalled();
      expect(mockUserService.findUserByCompanyEmail).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
      expect(mockMailService.send).toBeCalled();
    });

    it('should throw InvalidNotFoundException when time off request not found', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        timeOffRequestService.sendEmailToAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidNotFoundException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
    });

    it('should throw InvalidBadRequestException when status is approved or refused', async () => {
      timeOffRequestEntity.status = RequestStatusType.APPROVED;

      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestValidator, 'validateTimeOffRequestStatus')
        .mockImplementationOnce(() => {
          throw new InvalidBadRequestException(
            ErrorCode.CANNOT_UPDATE_TIME_OFF_REQUEST_APPROVED_OR_REFUSED,
          );
        });

      await expect(
        timeOffRequestService.sendEmailToAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestMapper.toTimeOffRequestEntityToUpdate,
      ).toBeCalled();
      expect(
        mockTimeOffRequestValidator.validateTimeOffRequestStatus,
      ).toBeCalled();
    });

    it('should throw InvalidBadRequestException when assistant is empty', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'findOneBy')
        .mockResolvedValueOnce(timeOffRequestEntity);

      jest
        .spyOn(mockTimeOffRequestMapper, 'toTimeOffRequestEntityToUpdate')
        .mockResolvedValueOnce(timeOffRequestEntity);

      timeOffRequestEntity.assistant = null;

      await expect(
        timeOffRequestService.sendEmailToAssistant(
          timeOffRequestEntity.id,
          updateTimeOffRequestDto,
        ),
      ).rejects.toThrow(InvalidBadRequestException);

      expect(timeOffRequestRepository.findOneBy).toBeCalled();
      expect(
        mockTimeOffRequestMapper.toTimeOffRequestEntityToUpdate,
      ).toBeCalled();
    });
  });

  describe('getPendingTimeOffRequestsCount', () => {
    it('should be return total pending time-off request', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(1),
        } as never);

      const result =
        await timeOffRequestService.getPendingTimeOffRequestsCount();

      expect(result).toEqual(1);

      expect(timeOffRequestRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getPendingTimeOffRequestsCountForUser', () => {
    it('should be return total pending time-off request for user', async () => {
      jest
        .spyOn(timeOffRequestRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(1),
        } as never);

      const result =
        await timeOffRequestService.getPendingTimeOffRequestsCountForUser(
          userLogin.id,
        );

      expect(result).toEqual(1);

      expect(timeOffRequestRepository.createQueryBuilder).toBeCalled();
    });
  });
});
