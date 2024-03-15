import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { BuddyBuddeeTouchpointController } from '../../controllers/buddy-buddee-touchpoint.controller';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';

describe('BuddyBuddeeTouchpointController', () => {
  let buddyBuddeeTouchpointController: BuddyBuddeeTouchpointController;
  const userDto = UserFake.buildUserDto();
  const user = UserFake.buildUserEntity(userDto);
  const buddeeTouchpointDtoPageDto =
    BuddyBuddeeTouchpointFake.buildBuddiesPageDto();
  const buddy = UserFake.buildUserEntity(userDto);
  const buddee = UserFake.buildUserEntity(
    UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
  );
  const buddyBuddeeTouchpointPageOptionsDto =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
  const buddyBuddeeTouchpointEntityDraft =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
      buddy,
      buddee,
      TouchpointStatus.DRAFT,
    );

  const buddyBuddeeTouchpointEntitySubmited =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
      buddy,
      buddee,
      TouchpointStatus.SUBMITTED,
    );

  const createBuddyBuddeeTouchpointRequestDto =
    BuddyBuddeeTouchpointFake.buildCreateBuddyBuddeeTouchpointRequestDto();

  const updateBuddyBuddeeTouchpointRequestDto =
    BuddyBuddeeTouchpointFake.buildUpdateBuddyBuddeeTouchpointRequestDto();

  const mockBuddyBuddeeTouchpointService = {
    getMyTouchpoints: jest.fn(),
    createBuddyBuddeeTouchpoint: jest.fn(),
    createDraftBuddyBuddeeTouchpoint: jest.fn(),
    updateDraftBuddyBuddeeTouchpoint: jest.fn(),
    submitDraftBuddyBuddeeTouchpoint: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuddyBuddeeTouchpointController],
      providers: [
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
        },
      ],
    }).compile();

    buddyBuddeeTouchpointController =
      module.get<BuddyBuddeeTouchpointController>(
        BuddyBuddeeTouchpointController,
      );
  });

  describe('getTouchpoints', () => {
    it('should return touch-points of a buddy', async () => {
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'getMyTouchpoints')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result = await buddyBuddeeTouchpointController.getTouchpoints(
        user,
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

      expect(mockBuddyBuddeeTouchpointService.getMyTouchpoints).toBeCalled();
    });
  });

  describe('createTouchpoint', () => {
    it('should create touch-point of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'createBuddyBuddeeTouchpoint')
        .mockReturnValueOnce(buddyBuddeeTouchpointEntitySubmited);

      const result = await buddyBuddeeTouchpointController.createTouchpoint(
        buddy,
        createBuddyBuddeeTouchpointRequestDto,
      );

      expect(result.id).toEqual(buddyBuddeeTouchpointEntitySubmited.id);
      expect(result.buddy.id).toEqual(
        buddyBuddeeTouchpointEntitySubmited.buddy.id,
      );
      expect(result.status).toEqual(TouchpointStatus.SUBMITTED);

      expect(
        mockBuddyBuddeeTouchpointService.createBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('createDraftBuddyBuddeeTouchpoint', () => {
    it('should create draft touch-point of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'createDraftBuddyBuddeeTouchpoint',
        )
        .mockReturnValueOnce(buddyBuddeeTouchpointEntityDraft);

      const result =
        await buddyBuddeeTouchpointController.createDraftBuddyBuddeeTouchpoint(
          buddy,
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointEntityDraft.id);
      expect(result.buddy.id).toEqual(
        buddyBuddeeTouchpointEntityDraft.buddy.id,
      );
      expect(result.status).toEqual(TouchpointStatus.DRAFT);

      expect(
        mockBuddyBuddeeTouchpointService.createDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('updateDraftBuddyBuddeeTouchpoint', () => {
    it('should update draft touch-point of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'updateDraftBuddyBuddeeTouchpoint',
        )
        .mockReturnValueOnce(buddyBuddeeTouchpointEntityDraft);

      const result =
        await buddyBuddeeTouchpointController.updateDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointEntityDraft.id,
          buddy,
          updateBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointEntityDraft.id);
      expect(result.note).toEqual(buddyBuddeeTouchpointEntityDraft.note);
      expect(result.visible).toEqual(buddyBuddeeTouchpointEntityDraft.visible);

      expect(
        mockBuddyBuddeeTouchpointService.updateDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('submitDraftBuddyBuddeeTouchpoint', () => {
    it('should submit touch-point of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'submitDraftBuddyBuddeeTouchpoint',
        )
        .mockReturnValueOnce(buddyBuddeeTouchpointEntitySubmited);

      const result =
        await buddyBuddeeTouchpointController.submitDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointEntitySubmited.id,
          buddy,
          updateBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointEntitySubmited.id);
      expect(result.note).toEqual(buddyBuddeeTouchpointEntitySubmited.note);
      expect(result.visible).toEqual(
        buddyBuddeeTouchpointEntitySubmited.visible,
      );
      expect(result.status).toEqual(TouchpointStatus.SUBMITTED);

      expect(
        mockBuddyBuddeeTouchpointService.submitDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });
});
