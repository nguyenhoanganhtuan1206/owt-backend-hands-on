import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AdminBuddyController } from '../../controllers/admin-buddy.controller';
import { BuddyService } from '../../services/buddy.service';
import { BuddyFake } from '../fakes/buddy.fake';

describe('AdminBuddyController', () => {
  let adminBuddyController: AdminBuddyController;

  const buddy = BuddyFake.buildBuddyDto();
  const buddies = [buddy];

  const mockBuddyService = {
    getBuddies: jest.fn(),
    createBuddy: jest.fn(),
    deleteBuddy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyController],
      providers: [
        {
          provide: BuddyService,
          useValue: mockBuddyService,
        },
      ],
    }).compile();

    adminBuddyController =
      module.get<AdminBuddyController>(AdminBuddyController);
  });

  describe('getBuddies', () => {
    const buddyPageOptions = BuddyFake.buildBuddyPageOptionsDto();
    const buddyDtosPageDto = BuddyFake.buildBuddyDtosPageDto();

    it('should return all buddies', async () => {
      jest.spyOn(mockBuddyService, 'getBuddies').mockReturnValueOnce(buddies);

      const result = await adminBuddyController.getBuddies(buddyPageOptions);

      expect(result[0].id).toEqual(buddyDtosPageDto.data[0].id);
      expect(result[0].buddy).toEqual(buddyDtosPageDto.data[0].buddy);

      expect(mockBuddyService.getBuddies).toBeCalled();
    });
  });

  describe('createBuddy', () => {
    const createBuddy = BuddyFake.buildCreateBuddyRequestDto();

    it('should create a buddy', async () => {
      jest.spyOn(mockBuddyService, 'createBuddy').mockReturnValueOnce(buddy);

      const result = await adminBuddyController.createBuddy(createBuddy);

      expect(result.id).toEqual(buddy.id);
      expect(result.buddy).toEqual(buddy.buddy);

      expect(mockBuddyService.createBuddy).toBeCalled();
    });
  });

  describe('deleteBuddy', () => {
    it('should delete a buddy', async () => {
      jest.spyOn(mockBuddyService, 'deleteBuddy');

      await adminBuddyController.deleteBuddy(buddy.id);

      expect(mockBuddyService.deleteBuddy).toBeCalledWith(buddy.id);
    });
  });
});
