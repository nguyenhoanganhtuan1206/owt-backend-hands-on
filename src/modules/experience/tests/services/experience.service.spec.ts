/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidBadRequestException } from '../../../../exceptions';
import { SkillService } from '../../../skill/services/skill.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { ExperienceDto } from '../../dtos/experience.dto';
import { ExperienceEntity } from '../../entities/experience.entity';
import { ExperienceSkillEntity } from '../../entities/experience-skill.entity';
import ExperienceMapper from '../../mappers/experience.mapper';
import { ExperienceService } from '../../services/experience.service';
import {
  experienceDto,
  experienceEntity,
  invalidCreateExperienceDtoDateToBeforeDateFrom,
  invalidCreateExperienceDtoHaveBothDateToAndIsCurrentlyWorking,
  invalidCreateExperienceDtoSkillIdsEmpty,
  invalidUpdateExperienceDtosDateToBeforeDateFrom,
  invalidUpdateExperienceDtosHaveBothDateToAndIsCurrentlyWorking,
  invalidUpdateExperienceDtosSkillIdsEmpty,
  updatePositionExperienceEntity,
  updateToggleExperienceEntity,
  validCreateExperienceDto,
  validUpdateExperienceDtos,
  validUpdateExperiencePosition,
} from '../fakes/experience.fake';
import { experienceSkillEntity } from '../fakes/experience-skill.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('Experience service', () => {
  let experienceService: ExperienceService;
  let experienceRepository: Repository<ExperienceEntity>;
  let experienceSkillRepository: Repository<ExperienceSkillEntity>;

  const userDto = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userDto);

  const mockExperienceMapper = {
    toExperienceEntity: jest.fn(),
    updateEntity: jest.fn(),
    toExperienceEntityFromIdAndUserId: jest.fn(),
  };

  const mockSkillService = {
    getSkillsByIds: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        {
          provide: ExperienceMapper,
          useValue: mockExperienceMapper,
        },
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: getRepositoryToken(ExperienceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ExperienceSkillEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    experienceService = module.get<ExperienceService>(ExperienceService);
    experienceRepository = module.get<Repository<ExperienceEntity>>(
      getRepositoryToken(ExperienceEntity),
    );
    experienceSkillRepository = module.get<Repository<ExperienceSkillEntity>>(
      getRepositoryToken(ExperienceSkillEntity),
    );
  });

  describe('createExperience', () => {
    it('createExperience successfully', async () => {
      mockExperienceMapper.toExperienceEntity = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      mockSkillService.getSkillsByIds = jest.fn().mockResolvedValue([]);
      experienceRepository.find = jest.fn().mockResolvedValue([]);
      experienceSkillRepository.save = jest
        .fn()
        .mockResolvedValue(experienceSkillEntity);
      experienceRepository.save = jest.fn().mockResolvedValue(experienceEntity);

      const result = await experienceService.createExperience(
        userEntity.id,
        validCreateExperienceDto,
      );

      expect(result).toEqual(experienceDto);
    });

    it('createExperience fail because have both dateTo and isCurrentlyWorking fields at the same time', async () => {
      await expect(
        experienceService.createExperience(
          userEntity.id,
          invalidCreateExperienceDtoHaveBothDateToAndIsCurrentlyWorking,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        ),
      );
    });

    it('createExperience fail because date to is before date from', async () => {
      await expect(
        experienceService.createExperience(
          userEntity.id,
          invalidCreateExperienceDtoDateToBeforeDateFrom,
        ),
      ).rejects.toThrow(
        new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM),
      );
    });

    it('createExperience fail because skillIds is empty', async () => {
      await expect(
        experienceService.createExperience(
          userEntity.id,
          invalidCreateExperienceDtoSkillIdsEmpty,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'At least one skill is required for the experience.',
        ),
      );
    });
  });

  describe('getExperiencesByUserId', () => {
    it('getExperiencesByUserId successfully', async () => {
      experienceRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue([experienceEntity]),
      });
      const result = await experienceService.getExperiencesByUserId(
        userEntity.id,
      );
      expect(result).toEqual([experienceDto]);
    });
  });

  describe('updateExperiences', () => {
    it('updateExperiences successfully', async () => {
      experienceRepository.findOne = jest
        .fn()
        .mockResolvedValue(experienceEntity);

      experienceSkillRepository.findOne = jest.fn();
      experienceSkillRepository.save = jest.fn();
      experienceSkillRepository.find = jest.fn().mockResolvedValue([]);
      experienceSkillRepository.remove = jest.fn();
      mockExperienceMapper.updateEntity = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      experienceRepository.save = jest.fn().mockResolvedValue(experienceEntity);

      const result = await experienceService.updateExperiences(
        userEntity.id,
        validUpdateExperienceDtos,
      );
      expect(result).toEqual([experienceDto]);
    });

    it('updateExperiences fail because experience not found', async () => {
      experienceRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        experienceService.updateExperiences(
          userEntity.id,
          validUpdateExperienceDtos,
        ),
      ).rejects.toThrow(new NotFoundException('Experience not found'));
    });

    it('updateExperiences fail because have both dateTo and isCurrentlyWorking fields at the same time', async () => {
      experienceRepository.findOne = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      await expect(
        experienceService.updateExperiences(
          userEntity.id,
          invalidUpdateExperienceDtosHaveBothDateToAndIsCurrentlyWorking,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot have both dateTo and isCurrentlyWorking fields at the same time',
        ),
      );
    });

    it('updateExperiences fail because date to is before date from', async () => {
      experienceRepository.findOne = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      await expect(
        experienceService.updateExperiences(
          userEntity.id,
          invalidUpdateExperienceDtosDateToBeforeDateFrom,
        ),
      ).rejects.toThrow(
        new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM),
      );
    });

    it('updateExperiences fail because skillIds is empty', async () => {
      experienceRepository.findOne = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      await expect(
        experienceService.updateExperiences(
          userEntity.id,
          invalidUpdateExperienceDtosSkillIdsEmpty,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'At least one skill is required for the experience.',
        ),
      );
    });
  });

  describe('deleteExperience', () => {
    it('deleteExperience successfully', async () => {
      experienceRepository.findOne = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      experienceRepository.find = jest.fn().mockResolvedValue([]);
      experienceRepository.remove = jest.fn();

      await experienceService.deleteExperience(
        userEntity.id,
        experienceEntity.id,
      );

      expect(experienceRepository.remove).toBeCalled();
    });

    it('deleteExperience fail because experience not found', async () => {
      experienceRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        experienceService.deleteExperience(userEntity.id, experienceEntity.id),
      ).rejects.toThrow(new NotFoundException('Experience not found'));
    });
  });

  describe('updateExperiencePositions', () => {
    it('updateExperiencePositions successfully', async () => {
      experienceRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue([
          updatePositionExperienceEntity(
            updatePositionExperienceEntity().position + 1,
          ),
          {
            ...updatePositionExperienceEntity(
              updatePositionExperienceEntity().position,
              updatePositionExperienceEntity().id + 1,
            ),
            position: updatePositionExperienceEntity().position + 1,
            id: updatePositionExperienceEntity().id + 1,
          },
        ]),
      });
      experienceRepository.save = jest.fn();

      const result = await experienceService.updateExperiencePositions(
        userEntity.id,
        validUpdateExperiencePosition,
      );

      experienceEntity.toDto = jest.fn().mockResolvedValue(null);

      const expectation: ExperienceDto[] = [
        {
          ...experienceDto,
          id: updatePositionExperienceEntity().id,
          position: updatePositionExperienceEntity().position + 1,
        },
        {
          ...experienceDto,
          id: updatePositionExperienceEntity().id + 1,
          position: updatePositionExperienceEntity().position, // update position successfully
        },
      ];

      expect(result).toEqual(expectation);
    });
  });

  describe('updateToggleExperience', () => {
    it('updateToggleExperience successfully', async () => {
      mockExperienceMapper.toExperienceEntityFromIdAndUserId = jest
        .fn()
        .mockResolvedValue(experienceEntity);
      experienceRepository.save = jest
        .fn()
        .mockResolvedValue(updateToggleExperienceEntity());
      const result = await experienceService.updateToggleExperience(
        userEntity.id,
        experienceEntity.id,
      );
      const expectation = {
        ...experienceDto,
        isSelected: !experienceDto.isSelected,
      };
      expect(result).toEqual(expectation);
    });
  });
});
