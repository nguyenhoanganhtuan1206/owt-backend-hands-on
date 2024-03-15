import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyTimeTrackingController } from '../../controllers/my-time-tracking.controller';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { TimeTrackingFake } from '../fakes/time-tracking.fake';

describe('MyTimeTrackingController', () => {
  let myTimeTrackingController: MyTimeTrackingController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const pageOptions = TimeTrackingFake.buildTimeTrackingsPageOptionsDto();
  const timeTrackingDtosPageDto =
    TimeTrackingFake.buildTimeTrackingDtosPageDto();

  const mockTimeTrackingService = {
    getTimeTrackings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyTimeTrackingController],
      providers: [
        {
          provide: TimeTrackingService,
          useValue: mockTimeTrackingService,
        },
      ],
    }).compile();

    myTimeTrackingController = module.get<MyTimeTrackingController>(
      MyTimeTrackingController,
    );
  });

  describe('getMyTimeTrackings', () => {
    it('should return the list of time tracking of the current user', async () => {
      jest
        .spyOn(mockTimeTrackingService, 'getTimeTrackings')
        .mockReturnValueOnce(timeTrackingDtosPageDto);

      const result = await myTimeTrackingController.getMyTimeTrackings(
        pageOptions,
        userEntity,
      );

      expect(result.data[0].id).toEqual(timeTrackingDtosPageDto.data[0].id);
      expect(result.data[0].date).toEqual(timeTrackingDtosPageDto.data[0].date);
      expect(result.data[0].user).toEqual(timeTrackingDtosPageDto.data[0].user);

      expect(mockTimeTrackingService.getTimeTrackings).toBeCalled();
    });
  });
});
