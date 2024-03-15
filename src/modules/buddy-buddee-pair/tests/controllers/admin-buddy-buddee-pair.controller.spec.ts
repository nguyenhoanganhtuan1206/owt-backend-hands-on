import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { BuddyFake } from '../../../buddy/tests/fakes/buddy.fake';
import { BuddyBuddeeTouchpointService } from '../../../buddy-buddee-touchpoint/services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../../../buddy-buddee-touchpoint/tests/fakes/buddy-buddee-touchpoint.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminBuddyBuddeePairController } from '../../controllers/admin-buddy-buddee-pair.controller';
import { BuddyBuddeePairService } from '../../services/buddy-buddee-pair.service';
import { BuddyBuddeePairFake } from '../fakes/buddy-budee-pair.fake';

describe('AdminBuddyBuddeePairController', () => {
  let adminBuddyBuddeePairController: AdminBuddyBuddeePairController;

  const userDto = UserFake.buildUserDto();
  const buddy = UserFake.buildUserEntity(userDto);
  const buddee = UserFake.buildUserEntity(
    UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
  );
  const buddyBuddeePairDto = BuddyBuddeePairFake.buildBuddyBuddeePairDto(
    buddy,
    buddee,
  );
  const buddyBuddeePairs = [buddyBuddeePairDto];
  const buddyBuddeeTouchpointEntity =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointEntity(
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
        buddy,
        buddee,
        TouchpointStatus.SUBMITTED,
      ),
    );

  const mockBuddyBuddeePairService = {
    getBuddyPairs: jest.fn(),
    createBuddyPairs: jest.fn(),
    deleteBuddyPair: jest.fn(),
  };

  const mockBuddyBuddeeTouchpointService = {
    getTouchpointsByPairId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyBuddeePairController],
      providers: [
        {
          provide: BuddyBuddeePairService,
          useValue: mockBuddyBuddeePairService,
        },
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
        },
      ],
    }).compile();

    adminBuddyBuddeePairController = module.get<AdminBuddyBuddeePairController>(
      AdminBuddyBuddeePairController,
    );
  });

  describe('getBuddyPairs', () => {
    const buddyPageOptions = BuddyFake.buildBuddyPageOptionsDto();
    const buddyDtosPageDto =
      BuddyBuddeePairFake.buildBuddyBuddeePairDtosPageDto(buddy, buddee);

    it('should return pairs of buddy and buddees', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'getBuddyPairs')
        .mockReturnValueOnce(buddyDtosPageDto);

      const result =
        await adminBuddyBuddeePairController.getBuddyPairs(buddyPageOptions);

      expect(result.data[0].id).toEqual(buddyDtosPageDto.data[0].id);
      expect(result.data[0].buddy).toEqual(buddyDtosPageDto.data[0].buddy);
      expect(result.data[0].buddee).toEqual(buddyDtosPageDto.data[0].buddee);

      expect(mockBuddyBuddeePairService.getBuddyPairs).toBeCalled();
    });
  });

  describe('createBuddyPairs', () => {
    const createBuddyBuddeesPairRequestDto =
      BuddyBuddeePairFake.buildCreateBuddyBuddeesPairRequestDto();

    it('should create pairs of buddy and buddees', async () => {
      jest
        .spyOn(mockBuddyBuddeePairService, 'createBuddyPairs')
        .mockReturnValueOnce(buddyBuddeePairs);

      const result = await adminBuddyBuddeePairController.createBuddyPairs(
        createBuddyBuddeesPairRequestDto,
      );

      expect(result[0].id).toEqual(buddyBuddeePairs[0].id);
      expect(result[0].buddy).toEqual(buddyBuddeePairs[0].buddy);
      expect(result[0].buddee).toEqual(buddyBuddeePairs[0].buddee);

      expect(mockBuddyBuddeePairService.createBuddyPairs).toBeCalled();
    });
  });

  describe('deleteBuddyPair', () => {
    it('should delete a pair of buddy and buddee by id', async () => {
      jest.spyOn(mockBuddyBuddeePairService, 'deleteBuddyPair');

      await adminBuddyBuddeePairController.deleteBuddyPair(
        buddyBuddeePairDto.id,
      );

      expect(mockBuddyBuddeePairService.deleteBuddyPair).toBeCalledWith(
        buddyBuddeePairDto.id,
      );
    });
  });

  describe('getTouchpoints', () => {
    const pageOptions =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const resultPage =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDtoPageByTouchpoint(
        buddyBuddeeTouchpointEntity,
      );

    it('should return touch-points of a pair', async () => {
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'getTouchpointsByPairId')
        .mockReturnValueOnce(resultPage);

      const result = await adminBuddyBuddeePairController.getTouchpoints(
        buddyBuddeeTouchpointEntity.id,
        pageOptions,
      );

      expect(result.data[0].id).toEqual(resultPage.data[0].id);
      expect(result.data[0].buddy).toEqual(resultPage.data[0].buddy);
      expect(result.data[0].buddee).toEqual(resultPage.data[0].buddee);
      expect(result.data[0].note).toEqual(resultPage.data[0].note);

      expect(
        mockBuddyBuddeeTouchpointService.getTouchpointsByPairId,
      ).toBeCalled();
    });
  });
});
