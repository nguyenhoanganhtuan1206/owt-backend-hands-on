/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import type { CreateSkillGroupDto } from '../../dtos/create-skill-group.dto';
import type { UpdateSkillGroupDto } from '../../dtos/update-skill-group.dto';
import { SkillGroupEntity } from '../../entities/skill-group.entity';
import SkillGroupMapper from '../../mappers/skill-group.mapper';
import { SkillGroupService } from '../../services/skill-group.service';
import {
  createSkillGroupDto,
  skillGroupEntity,
  skillGroupsPageDto,
  skillGroupsPageOptionsDto,
  updateSkillGroupDto,
} from '../fakes/skill-group.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('SkillGroupService', () => {
  let skillGroupService: SkillGroupService;
  let skillGroupRepository: Repository<SkillGroupEntity>;

  const skillGroup = { ...skillGroupEntity } as SkillGroupEntity;
  const skillGroups = [skillGroup];

  const mockSkillGroupMapper = {
    toSkillGroupEntity: jest.fn(),
    toSkillGroupEntityFromId: jest.fn(),
    toSkillGroupEntityToUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillGroupService,
        {
          provide: SkillGroupMapper,
          useValue: mockSkillGroupMapper,
        },
        {
          provide: getRepositoryToken(SkillGroupEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    skillGroupService = module.get<SkillGroupService>(SkillGroupService);
    skillGroupRepository = module.get<Repository<SkillGroupEntity>>(
      getRepositoryToken(SkillGroupEntity),
    );
  });

  describe('getAllSkillGroups', () => {
    const pageOptions = skillGroupsPageOptionsDto;
    const skillGroupDtos = skillGroupsPageDto;

    it('should return all skill groups', async () => {
      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([skillGroups, skillGroupDtos.meta]),
                ),
            }) as never,
        );

      const result = await skillGroupService.getAllSkillGroups(pageOptions);

      expect(result.data[0].id).toEqual(skillGroupDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillGroupDtos.data[0].name);
      expect(result.data[0].skills).toEqual(skillGroupDtos.data[0].skills);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('createSkillGroup', () => {
    const createSkillGroup = {
      ...createSkillGroupDto,
      name: 'newSkillGroup',
    } as CreateSkillGroupDto;

    it('should creatae skill groups', async () => {
      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
            }) as never,
        );
      jest
        .spyOn(mockSkillGroupMapper, 'toSkillGroupEntity')
        .mockResolvedValueOnce(skillGroup);
      jest
        .spyOn(skillGroupRepository, 'save')
        .mockResolvedValueOnce(skillGroup);

      const result = await skillGroupService.createSkillGroup(createSkillGroup);

      expect(result.id).toEqual(skillGroup.id);
      expect(result.name).toEqual(skillGroup.name);
      expect(result.skills?.[0].id).toEqual(skillGroup.skills[0].id);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillGroupMapper.toSkillGroupEntity).toBeCalled();
      expect(skillGroupRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if skill group is existing', async () => {
      const createError = { ...createSkillGroupDto } as CreateSkillGroupDto;

      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest
                .fn()
                .mockImplementation(() => Promise.resolve(skillGroup)),
            }) as never,
        );

      await expect(
        skillGroupService.createSkillGroup(createError),
      ).rejects.toThrowError(BadRequestException);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateSkillGroup', () => {
    const updateSkillGroup = {
      ...updateSkillGroupDto,
      name: 'newSkillGroup',
    } as UpdateSkillGroupDto;

    it('should update skill groups', async () => {
      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
            }) as never,
        );
      jest
        .spyOn(mockSkillGroupMapper, 'toSkillGroupEntityFromId')
        .mockResolvedValueOnce(skillGroup);
      jest
        .spyOn(mockSkillGroupMapper, 'toSkillGroupEntityToUpdate')
        .mockResolvedValueOnce(skillGroup);
      jest
        .spyOn(skillGroupRepository, 'save')
        .mockResolvedValueOnce(skillGroup);

      const result = await skillGroupService.updateSkillGroup(
        skillGroup.id,
        updateSkillGroup,
      );

      expect(result.id).toEqual(skillGroup.id);
      expect(result.name).toEqual(skillGroup.name);
      expect(result.skills?.[0].id).toEqual(skillGroup.skills[0].id);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillGroupMapper.toSkillGroupEntityFromId).toBeCalled();
      expect(mockSkillGroupMapper.toSkillGroupEntityToUpdate).toBeCalled();
      expect(skillGroupRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if skill group is existing', async () => {
      const updateError = { ...updateSkillGroupDto } as UpdateSkillGroupDto;

      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest
                .fn()
                .mockImplementation(() => Promise.resolve(skillGroup)),
            }) as never,
        );

      await expect(
        skillGroupService.updateSkillGroup(skillGroup.id, updateError),
      ).rejects.toThrowError(BadRequestException);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if skill group is not found', async () => {
      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
            }) as never,
        );
      jest
        .spyOn(mockSkillGroupMapper, 'toSkillGroupEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND);
        });

      await expect(
        skillGroupService.updateSkillGroup(skillGroup.id, updateSkillGroup),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillGroupMapper.toSkillGroupEntityFromId).toBeCalled();
    });
  });

  describe('searchSkills', () => {
    const name = 'name';

    it('should return list skills of the current user', async () => {
      jest
        .spyOn(skillGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(skillGroups),
            }) as never,
        );

      const result = await skillGroupService.searchSkills(name);

      expect(result[0].id).toEqual(skillGroups[0].id);
      expect(result[0].name).toEqual(skillGroups[0].name);

      expect(skillGroupRepository.createQueryBuilder).toBeCalled();
    });
  });
});
