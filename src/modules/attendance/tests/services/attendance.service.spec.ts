/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import * as paginate from '../../../../common/dto/paginate-item';
import { TimeOffRequestService } from '../../../time-off-request/services/time-off-request.service';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { WfhRequestService } from '../../../wfh-request/services/wfh-request.service';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceFake } from '../fakes/attendance.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;

  const user = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(user);
  const userEntities = [userEntity];

  const mockUserService = {
    findUserById: jest.fn(),
    getUsersInOffice: jest.fn(),
    getUsersWithTimeoffRequestApproved: jest.fn(),
    getUsersWithWfhRequestApproved: jest.fn(),
    getUserQueryBuilder: jest.fn(),
  };

  const mockTimeOffRequestService = {
    calculateAllowanceUser: jest.fn(),
    getPendingTimeOffRequestsCount: jest.fn(),
    getPendingTimeOffRequestsCountForUser: jest.fn(),
  };

  const mockWfhRequestService = {
    getPendingWfhRequestsCount: jest.fn(),
    getPendingWfhRequestsCountForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TimeOffRequestService,
          useValue: mockTimeOffRequestService,
        },
        {
          provide: WfhRequestService,
          useValue: mockWfhRequestService,
        },
      ],
    }).compile();

    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  describe('findTotalRequestsAllUsers', () => {
    it('should return total requests for all users', async () => {
      const timeOffRequests = 5;
      const wfhRequests = 5;

      jest
        .spyOn(mockTimeOffRequestService, 'getPendingTimeOffRequestsCount')
        .mockResolvedValue(timeOffRequests);
      jest
        .spyOn(mockWfhRequestService, 'getPendingWfhRequestsCount')
        .mockResolvedValue(wfhRequests);

      const result = await attendanceService.findTotalRequestsAllUsers();

      expect(result.timeOffRequests).toEqual(timeOffRequests);
      expect(result.wfhRequests).toEqual(wfhRequests);

      expect(
        mockTimeOffRequestService.getPendingTimeOffRequestsCount,
      ).toBeCalled();
      expect(mockWfhRequestService.getPendingWfhRequestsCount).toBeCalled();
    });
  });

  describe('findTotalRequestsForUser', () => {
    it('should return total requests for current user login', async () => {
      const timeOffRequests = 5;
      const wfhRequests = 5;

      jest
        .spyOn(
          mockTimeOffRequestService,
          'getPendingTimeOffRequestsCountForUser',
        )
        .mockResolvedValue(timeOffRequests);

      jest
        .spyOn(mockWfhRequestService, 'getPendingWfhRequestsCountForUser')
        .mockResolvedValue(wfhRequests);

      const result =
        await attendanceService.findTotalRequestsForUser(userEntity);

      expect(result.timeOffRequests).toEqual(timeOffRequests);
      expect(result.wfhRequests).toEqual(wfhRequests);

      expect(
        mockTimeOffRequestService.getPendingTimeOffRequestsCountForUser,
      ).toBeCalled();
      expect(
        mockWfhRequestService.getPendingWfhRequestsCountForUser,
      ).toBeCalled();
    });
  });

  describe('getOtherUsers', () => {
    const pageOptionsDto = AttendanceFake.buildOtherUsersPageOptionsDto();
    const otherUserDtos = [AttendanceFake.buildOtherUserDto()];
    const otherUserPageDtos = AttendanceFake.buildOtherUserPageDto();

    it('should return all other users', async () => {
      pageOptionsDto.dateFrom = new Date();
      pageOptionsDto.dateTo = new Date();

      jest.spyOn(mockUserService, 'getUserQueryBuilder').mockImplementation(
        () =>
          ({
            getMany: jest.fn().mockResolvedValue(userEntities),
          }) as never,
      );
      jest
        .spyOn(mockUserService, 'getUsersInOffice')
        .mockImplementation(() => Promise.resolve(userEntities));
      jest
        .spyOn(mockUserService, 'getUsersWithTimeoffRequestApproved')
        .mockImplementation(() => Promise.resolve(userEntities));
      jest
        .spyOn(mockUserService, 'getUsersWithWfhRequestApproved')
        .mockImplementation(() => Promise.resolve(userEntities));
      jest.spyOn(paginate, 'paginateItems').mockReturnValueOnce(otherUserDtos);

      const result = await attendanceService.getOtherUsers(pageOptionsDto);

      expect(result.data[0].user).toEqual(otherUserPageDtos.data[0].user);

      expect(mockUserService.getUserQueryBuilder).toBeCalled();
      expect(mockUserService.getUsersInOffice).toBeCalled();
      expect(mockUserService.getUsersWithTimeoffRequestApproved).toBeCalled();
      expect(mockUserService.getUsersWithWfhRequestApproved).toBeCalled();
      expect(paginate.paginateItems).toBeCalled();
    });
  });
});
