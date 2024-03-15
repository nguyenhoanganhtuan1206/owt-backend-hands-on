/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { BuddyFake } from '../../../buddy/tests/fakes/buddy.fake';
import { BuddyBuddeePairFake } from '../../../buddy-buddee-pair/tests/fakes/buddy-budee-pair.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyBuddeeController } from '../../controllers/my-buddee.controller';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';

describe('MyBuddeeController', () => {
  let myBuddeeController: MyBuddeeController;
  const userDto = UserFake.buildUserDto();
  const user = UserFake.buildUserEntity(userDto);
  const buddyPageOptions = BuddyBuddeePairFake.buildBuddiesPageOptionsDto();
  const buddeeTouchpointDtoPageDto =
    BuddyBuddeeTouchpointFake.buildBuddiesPageDto();
  const buddee = BuddyFake.buildBuddyEntityByUserDto(userDto);
  const buddyBuddeeTouchpointPageOptionsDto =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();

  const mockBuddyService = {
    getMyBuddees: jest.fn(),
    getTouchpointsByBuddyIdAndBuddeeId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyBuddeeController],
      providers: [
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyService,
        },
      ],
    }).compile();

    myBuddeeController = module.get<MyBuddeeController>(MyBuddeeController);
  });

  describe('getMyBuddees', () => {
    it('should return my buddees and latest touch-point', async () => {
      jest
        .spyOn(mockBuddyService, 'getMyBuddees')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result = await myBuddeeController.getMyBuddees(
        user,
        buddyPageOptions,
      );

      expect(result.data[0].id).toEqual(buddeeTouchpointDtoPageDto.data[0].id);
      expect(result.data[0].status).toEqual(
        buddeeTouchpointDtoPageDto.data[0].status,
      );
      expect(result.data[0].buddee?.id).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddee?.id,
      );
      expect(result.data[0].buddy.id).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddy.id,
      );

      expect(mockBuddyService.getMyBuddees).toBeCalled();
    });
  });

  describe('getTouchpoints', () => {
    it('should return touch-points of a buddee', async () => {
      jest
        .spyOn(mockBuddyService, 'getTouchpointsByBuddyIdAndBuddeeId')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result = await myBuddeeController.getTouchpoints(
        user,
        buddee.id,
        buddyBuddeeTouchpointPageOptionsDto,
      );

      expect(result.data[0].id).toEqual(buddeeTouchpointDtoPageDto.data[0].id);
      expect(result.data[0].status).toEqual(
        buddeeTouchpointDtoPageDto.data[0].status,
      );
      expect(result.data[0].buddee?.id).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddee?.id,
      );
      expect(result.data[0].buddy.id).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddy.id,
      );

      expect(mockBuddyService.getTouchpointsByBuddyIdAndBuddeeId).toBeCalled();
    });
  });
});
