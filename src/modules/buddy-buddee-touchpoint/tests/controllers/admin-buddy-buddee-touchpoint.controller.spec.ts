import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { TouchpointStatus } from '../../../../constants/touchpoint-status';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminBuddyBuddeeTouchpointController } from '../../controllers/admin-buddy-buddee-touchpoint.controller';
import { BuddyBuddeeTouchpointService } from '../../services/buddy-buddee-touchpoint.service';
import { BuddyBuddeeTouchpointFake } from '../fakes/buddy-buddee-touchpoint.fake';

describe('AdminBuddyBuddeeTouchpointController', () => {
  let adminBuddyBuddeeTouchpointController: AdminBuddyBuddeeTouchpointController;

  const userDto = UserFake.buildUserDto();
  const buddy = UserFake.buildUserEntity(userDto);
  const buddee = UserFake.buildUserEntity(
    UserFake.buildUserDtoBy(2, 'buddee@gmail.com'),
  );
  const buddyBuddeeTouchpointDraft =
    BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointDto(
      buddy,
      buddee,
      TouchpointStatus.DRAFT,
    );
  const buddyBuddeeTouchpointSubmited =
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
    getBuddyPairTouchpoints: jest.fn(),
    createBuddyBuddeeTouchpoint: jest.fn(),
    createDraftBuddyBuddeeTouchpoint: jest.fn(),
    updateDraftBuddyBuddeeTouchpoint: jest.fn(),
    submitDraftBuddyBuddeeTouchpoint: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBuddyBuddeeTouchpointController],
      providers: [
        {
          provide: BuddyBuddeeTouchpointService,
          useValue: mockBuddyBuddeeTouchpointService,
        },
      ],
    }).compile();

    adminBuddyBuddeeTouchpointController =
      module.get<AdminBuddyBuddeeTouchpointController>(
        AdminBuddyBuddeeTouchpointController,
      );
  });

  describe('getBuddyPairTouchpoints', () => {
    const pageOptions =
      BuddyBuddeeTouchpointFake.buildBuddyBuddeeTouchpointPageOptionsDto();
    const buddeeTouchpointDtoPageDto =
      BuddyBuddeeTouchpointFake.buildBuddiesPageDto();

    it('should return latest touchpoint of buddy and buddee pair', async () => {
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'getBuddyPairTouchpoints')
        .mockReturnValueOnce(buddeeTouchpointDtoPageDto);

      const result =
        await adminBuddyBuddeeTouchpointController.getBuddyPairTouchpoints(
          pageOptions,
        );

      expect(result.data[0].id).toEqual(buddeeTouchpointDtoPageDto.data[0].id);
      expect(result.data[0].buddy).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddy,
      );
      expect(result.data[0].buddee).toEqual(
        buddeeTouchpointDtoPageDto.data[0].buddee,
      );
      expect(result.data[0].note).toEqual(
        buddeeTouchpointDtoPageDto.data[0].note,
      );

      expect(
        mockBuddyBuddeeTouchpointService.getBuddyPairTouchpoints,
      ).toBeCalled();
    });
  });

  describe('createBuddyBuddeeTouchpoint', () => {
    it('should create touchpoint of buddy and buddee', async () => {
      jest
        .spyOn(mockBuddyBuddeeTouchpointService, 'createBuddyBuddeeTouchpoint')
        .mockReturnValueOnce(buddyBuddeeTouchpointSubmited);

      const result =
        await adminBuddyBuddeeTouchpointController.createBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointSubmited.id);
      expect(result.buddy).toEqual(buddyBuddeeTouchpointSubmited.buddy);
      expect(result.buddee).toEqual(buddyBuddeeTouchpointSubmited.buddee);
      expect(result.note).toEqual(buddyBuddeeTouchpointSubmited.note);
      expect(result.status).toEqual(buddyBuddeeTouchpointSubmited.status);

      expect(
        mockBuddyBuddeeTouchpointService.createBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('createDraftBuddyBuddeeTouchpoint', () => {
    it('should create draft touchpoint of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'createDraftBuddyBuddeeTouchpoint',
        )
        .mockResolvedValueOnce(buddyBuddeeTouchpointDraft);

      const result =
        await adminBuddyBuddeeTouchpointController.createDraftBuddyBuddeeTouchpoint(
          createBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointDraft.id);
      expect(result.buddy).toEqual(buddyBuddeeTouchpointDraft.buddy);
      expect(result.buddee).toEqual(buddyBuddeeTouchpointDraft.buddee);
      expect(result.note).toEqual(buddyBuddeeTouchpointDraft.note);
      expect(result.status).toEqual(buddyBuddeeTouchpointDraft.status);

      expect(
        mockBuddyBuddeeTouchpointService.createDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('updateDraftBuddyBuddeeTouchpoint', () => {
    it('should update draft touchpoint of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'updateDraftBuddyBuddeeTouchpoint',
        )
        .mockResolvedValueOnce(buddyBuddeeTouchpointDraft);

      const result =
        await adminBuddyBuddeeTouchpointController.updateDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointDraft.id,
          updateBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointDraft.id);
      expect(result.buddy).toEqual(buddyBuddeeTouchpointDraft.buddy);
      expect(result.buddee).toEqual(buddyBuddeeTouchpointDraft.buddee);
      expect(result.note).toEqual(buddyBuddeeTouchpointDraft.note);
      expect(result.status).toEqual(buddyBuddeeTouchpointDraft.status);

      expect(
        mockBuddyBuddeeTouchpointService.updateDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });

  describe('submitDraftBuddyBuddeeTouchpoint', () => {
    it('should submit draft touchpoint of buddy and buddee', async () => {
      jest
        .spyOn(
          mockBuddyBuddeeTouchpointService,
          'submitDraftBuddyBuddeeTouchpoint',
        )
        .mockResolvedValueOnce(buddyBuddeeTouchpointSubmited);

      const result =
        await adminBuddyBuddeeTouchpointController.submitDraftBuddyBuddeeTouchpoint(
          buddyBuddeeTouchpointDraft.id,
          updateBuddyBuddeeTouchpointRequestDto,
        );

      expect(result.id).toEqual(buddyBuddeeTouchpointSubmited.id);
      expect(result.buddy).toEqual(buddyBuddeeTouchpointSubmited.buddy);
      expect(result.buddee).toEqual(buddyBuddeeTouchpointSubmited.buddee);
      expect(result.note).toEqual(buddyBuddeeTouchpointSubmited.note);
      expect(result.status).toEqual(buddyBuddeeTouchpointSubmited.status);

      expect(
        mockBuddyBuddeeTouchpointService.submitDraftBuddyBuddeeTouchpoint,
      ).toBeCalled();
    });
  });
});
