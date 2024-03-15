import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AwsS3Service } from '../../../../shared/services/aws-s3.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AttendanceController } from '../../controllers/attendance.controller';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceFake } from '../fakes/attendance.fake';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;

  const user = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(user);
  const totalRequest = AttendanceFake.buildTotalRequestDto();
  const deleteFileDto = AttendanceFake.buildDeleteFileDto();

  const mockAttendanceService = {
    findTotalRequestsAllUsers: jest.fn(),
    findTotalRequestsForUser: jest.fn(),
  };

  const mockAwsS3Service = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    attendanceController =
      module.get<AttendanceController>(AttendanceController);
  });

  describe('getTotalRequests', () => {
    it('should return total requests for current user login', async () => {
      jest
        .spyOn(mockAttendanceService, 'findTotalRequestsForUser')
        .mockReturnValue(totalRequest);

      const result = await attendanceController.getTotalRequests(userEntity);

      expect(result.timeOffRequests).toEqual(totalRequest.timeOffRequests);
      expect(result.wfhRequests).toEqual(totalRequest.wfhRequests);

      expect(mockAttendanceService.findTotalRequestsForUser).toBeCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete attach file by user login', async () => {
      jest.spyOn(mockAwsS3Service, 'deleteFile').mockReturnThis();

      await attendanceController.deleteFile(deleteFileDto);

      expect(mockAwsS3Service.deleteFile).toBeCalledWith(deleteFileDto.fileUrl);
    });
  });
});
