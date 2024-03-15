import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminAttendanceController } from '../../controllers/admin-attendance.controller';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceFake } from '../fakes/attendance.fake';

describe('AdminAttendanceController', () => {
  let adminAttendanceController: AdminAttendanceController;

  const totalRequest = AttendanceFake.buildTotalRequestDto();
  const pageOptionsDto = AttendanceFake.buildOtherUsersPageOptionsDto();
  const otherUserDtos = AttendanceFake.buildOtherUserPageDto();

  const mockAttendanceService = {
    findTotalRequestsAllUsers: jest.fn(),
    getOtherUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    adminAttendanceController = module.get<AdminAttendanceController>(
      AdminAttendanceController,
    );
  });

  describe('getTotalRequests', () => {
    it('should return total requests for all users', async () => {
      jest
        .spyOn(mockAttendanceService, 'findTotalRequestsAllUsers')
        .mockReturnValue(totalRequest);

      const result = await adminAttendanceController.getTotalRequests();

      expect(result.timeOffRequests).toEqual(totalRequest.timeOffRequests);
      expect(result.wfhRequests).toEqual(totalRequest.wfhRequests);

      expect(mockAttendanceService.findTotalRequestsAllUsers).toBeCalled();
    });
  });

  describe('getOtherUsers', () => {
    it('should return list of people whose names are not shown on the other 3 tabs(in-office, time-off, wfh)', async () => {
      jest
        .spyOn(mockAttendanceService, 'getOtherUsers')
        .mockReturnValue(otherUserDtos);

      const result =
        await adminAttendanceController.getOtherUsers(pageOptionsDto);

      expect(result).toEqual(otherUserDtos);

      expect(mockAttendanceService.getOtherUsers).toBeCalled();
    });
  });
});
