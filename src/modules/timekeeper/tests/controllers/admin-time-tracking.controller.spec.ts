import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminTimeTrackingController } from '../../controllers/admin-time-tracking.controller';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { TimeTrackingFake } from '../fakes/time-tracking.fake';

describe('AdminTimeTrackingController', () => {
  let adminTimeTrackingController: AdminTimeTrackingController;

  const pageOptions = TimeTrackingFake.buildTimeTrackingsPageOptionsDto();
  const timeTrackingDtosPageDto =
    TimeTrackingFake.buildTimeTrackingDtosPageDto();
  const userTimekeeper = TimeTrackingFake.buildUserTimekeeperDto();

  const mockTimeTrackingService = {
    getTimeTrackings: jest.fn(),
    getUserTimekeepers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTimeTrackingController],
      providers: [
        {
          provide: TimeTrackingService,
          useValue: mockTimeTrackingService,
        },
      ],
    }).compile();

    adminTimeTrackingController = module.get<AdminTimeTrackingController>(
      AdminTimeTrackingController,
    );
  });

  describe('getTimeTrackings', () => {
    it('should get list time trackings for all user', async () => {
      jest
        .spyOn(mockTimeTrackingService, 'getTimeTrackings')
        .mockReturnValueOnce(timeTrackingDtosPageDto);

      const result =
        await adminTimeTrackingController.getTimeTrackings(pageOptions);

      expect(result.data[0].id).toEqual(timeTrackingDtosPageDto.data[0].id);
      expect(result.data[0].date).toEqual(timeTrackingDtosPageDto.data[0].date);
      expect(result.data[0].user).toEqual(timeTrackingDtosPageDto.data[0].user);

      expect(mockTimeTrackingService.getTimeTrackings).toBeCalled();
    });
  });

  describe('getUserTimekeepers', () => {
    it('should get list time trackings for all user', async () => {
      const userTimekeepers = [userTimekeeper];

      jest
        .spyOn(mockTimeTrackingService, 'getUserTimekeepers')
        .mockReturnValueOnce(userTimekeepers);

      const result = await adminTimeTrackingController.getUserTimekeepers();

      expect(result[0].name).toEqual(userTimekeepers[0].name);
      expect(result[0].timekeeperUserId).toEqual(
        userTimekeepers[0].timekeeperUserId,
      );

      expect(mockTimeTrackingService.getUserTimekeepers).toBeCalled();
    });
  });
});
