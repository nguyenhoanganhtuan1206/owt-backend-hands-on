import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminExperienceController } from '../../controllers/admin-experience.controller';
import { ExperienceService } from '../../services/experience.service';
import {
  experienceDto,
  experienceEntity,
  validCreateExperienceDto,
  validUpdateExperienceDtos,
  validUpdateExperiencePosition,
} from '../fakes/experience.fake';

describe('Admin experience controller', () => {
  let adminExperienceController: AdminExperienceController;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);

  const mockExperienceService = {
    createExperience: jest.fn(),
    getExperiencesByUserId: jest.fn(),
    updateToggleExperience: jest.fn(),
    updateExperiencePositions: jest.fn(),
    updateExperiences: jest.fn(),
    deleteExperience: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminExperienceController],
      providers: [
        {
          provide: ExperienceService,
          useValue: mockExperienceService,
        },
      ],
    }).compile();

    adminExperienceController = module.get<AdminExperienceController>(
      AdminExperienceController,
    );
  });

  describe(`createExperience`, () => {
    it(`createExperience successfully`, async () => {
      mockExperienceService.createExperience = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await adminExperienceController.createExperience(
        userEntity.id,
        validCreateExperienceDto,
      );

      expect(result).toEqual(experienceDto);
    });
  });

  describe(`getExperiences`, () => {
    it(`getExperiences successfully`, async () => {
      mockExperienceService.getExperiencesByUserId = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await adminExperienceController.getExperiences(
        userEntity.id,
      );

      expect(result).toEqual(experienceDto);
    });
  });

  describe(`updateToggleExperience`, () => {
    it(`updateToggleExperience successfully`, async () => {
      mockExperienceService.updateToggleExperience = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await adminExperienceController.updateToggleExperience(
        userEntity.id,
        experienceEntity.id,
      );

      expect(result).toEqual(experienceDto);
    });
  });

  describe(`updateExperiencePositions`, () => {
    it(`updateExperiencePositions successfully`, async () => {
      mockExperienceService.updateExperiencePositions = jest
        .fn()
        .mockResolvedValue([experienceDto]);

      const result = await adminExperienceController.updateExperiencePositions(
        userEntity.id,
        validUpdateExperiencePosition,
      );

      expect(result).toEqual([experienceDto]);
    });
  });

  describe(`updateExperiences`, () => {
    it(`updateExperiences successfully`, async () => {
      mockExperienceService.updateExperiences = jest
        .fn()
        .mockResolvedValue([experienceDto]);

      const result = await adminExperienceController.updateExperiences(
        validUpdateExperienceDtos,
        userEntity.id,
      );

      expect(result).toEqual([experienceDto]);
    });
  });

  describe(`deleteExperience`, () => {
    it(`deleteExperience successfully`, async () => {
      mockExperienceService.deleteExperience = jest.fn();

      await adminExperienceController.deleteExperience(
        userEntity.id,
        experienceEntity.id,
      );

      expect(mockExperienceService.deleteExperience).toBeCalled();
    });
  });
});
