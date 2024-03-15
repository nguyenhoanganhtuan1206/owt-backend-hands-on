import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MyExperienceController } from '../../controllers/my-experience.controller';
import { ExperienceService } from '../../services/experience.service';
import {
  experienceDto,
  experienceEntity,
  validCreateExperienceDto,
  validUpdateExperienceDtos,
  validUpdateExperiencePosition,
} from '../fakes/experience.fake';

describe('My experience controller', () => {
  let myExperienceController: MyExperienceController;

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
      controllers: [MyExperienceController],
      providers: [
        {
          provide: ExperienceService,
          useValue: mockExperienceService,
        },
      ],
    }).compile();

    myExperienceController = module.get<MyExperienceController>(
      MyExperienceController,
    );
  });

  describe('createMyExperience', () => {
    it('createMyExperience successfully', async () => {
      mockExperienceService.createExperience = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await myExperienceController.createMyExperience(
        userEntity,
        validCreateExperienceDto,
      );

      expect(result).toEqual(experienceDto);
    });
  });

  describe('getMyExperiences', () => {
    it('getMyExperiences successfully', async () => {
      mockExperienceService.getExperiencesByUserId = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await myExperienceController.getMyExperiences(userEntity);

      expect(result).toEqual(experienceDto);
    });
  });

  describe('updateToggleExperience', () => {
    it('updateToggleExperience successfully', async () => {
      mockExperienceService.updateToggleExperience = jest
        .fn()
        .mockResolvedValue(experienceDto);

      const result = await myExperienceController.updateToggleExperience(
        userEntity,
        experienceEntity.id,
      );

      expect(result).toEqual(experienceDto);
    });
  });

  describe('updateMyExperiencePositions', () => {
    it('updateMyExperiencePositions successfully', async () => {
      mockExperienceService.updateExperiencePositions = jest
        .fn()
        .mockResolvedValue([experienceDto]);

      const result = await myExperienceController.updateMyExperiencePositions(
        userEntity,
        validUpdateExperiencePosition,
      );

      expect(result).toEqual([experienceDto]);
    });
  });

  describe('updateMyExperiences', () => {
    it('updateMyExperiences successfully', async () => {
      mockExperienceService.updateExperiences = jest
        .fn()
        .mockResolvedValue([experienceDto]);

      const result = await myExperienceController.updateMyExperiences(
        userEntity,
        validUpdateExperienceDtos,
      );

      expect(result).toEqual([experienceDto]);
    });
  });

  describe('deleteExperience', () => {
    it('deleteExperience successfully', async () => {
      mockExperienceService.deleteExperience = jest.fn();

      await myExperienceController.deleteExperience(
        userEntity,
        experienceEntity.id,
      );

      expect(mockExperienceService.deleteExperience).toBeCalled();
    });
  });
});
