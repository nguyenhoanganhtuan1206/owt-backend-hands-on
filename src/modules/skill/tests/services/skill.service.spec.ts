/* eslint-disable @typescript-eslint/unbound-method */
import '../../../../boilerplate.polyfill';

import { BadRequestException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../../exceptions';
import { SkillGroupEntity } from '../../../skill-group/entities/skill-group.entity';
import { SkillGroupService } from '../../../skill-group/services/skill-group.service';
import {
  skillGroupEntity,
  skillGroupsPageDto,
  skillGroupsPageOptionsDto,
} from '../../../skill-group/tests/fakes/skill-group.fake';
import { UserService } from '../../../user/services/user.service';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateSkillDto } from '../../dtos/create-skill.dto';
import type UpdateMySkillDto from '../../dtos/update-my-skill.dto';
import type { UpdateSkillDto } from '../../dtos/update-skill.dto';
import type { UpdateSkillLevelDto } from '../../dtos/update-skill-level.dto';
import { SkillEntity } from '../../entities/skill.entity';
import { UserSkillEntity } from '../../entities/user-skill.entity';
import SkillMapper from '../../mappers/skill.mapper';
import { SkillService } from '../../services/skill.service';
import {
  createSkillDto,
  skillEntity,
  skillsPageDto,
  skillsPageOptionsDto,
  updateMySkillDto,
  updateSkillDto,
  updateSkillLevelDto,
  userSkillEntity,
} from '../fakes/skill.fake';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
}));

describe('SkillService', () => {
  let skillService: SkillService;
  let skillRepository: Repository<SkillEntity>;
  let userSkillRepository: Repository<UserSkillEntity>;

  const userLogin = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(userLogin);
  const skill = skillEntity;
  const skills = [skill];
  const skillGroup = {
    ...skillGroupEntity,
    skills: [skillEntity],
  } as SkillGroupEntity;
  const skillGroups = [skillGroup];
  const userSkill = userSkillEntity;
  const userSkills = [userSkillEntity];

  const mockUserService = {
    findUserById: jest.fn(),
  };

  const mockSkillMapper = {
    toSkillEntity: jest.fn(),
    toSkillEntityFromId: jest.fn(),
    toSkillEntityToUpdate: jest.fn(),
  };

  const mockSkillGroupService = {
    getSkillGroupQueryBuilderByOrderBy: jest.fn(),
    findSkillGroupById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: SkillMapper,
          useValue: mockSkillMapper,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(SkillEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SkillGroupEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserSkillEntity),
          useClass: Repository,
        },
        {
          provide: SkillGroupService,
          useValue: mockSkillGroupService,
        },
      ],
    }).compile();

    skillService = module.get<SkillService>(SkillService);
    skillRepository = module.get<Repository<SkillEntity>>(
      getRepositoryToken(SkillEntity),
    );
    userSkillRepository = module.get<Repository<UserSkillEntity>>(
      getRepositoryToken(UserSkillEntity),
    );
  });

  describe('getAllSkills', () => {
    const pageOptions = skillsPageOptionsDto;
    const skillDtos = skillsPageDto;

    it('should return list skills of the current user', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            paginate: jest
              .fn()
              .mockImplementation(() =>
                Promise.resolve([skills, skillDtos.meta]),
              ),
          }) as never,
      );

      const result = await skillService.getAllSkills(pageOptions);

      expect(result.data[0].id).toEqual(skillDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillDtos.data[0].name);

      expect(skillRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('getSkillsByUserId', () => {
    const pageOptions = skillGroupsPageOptionsDto;
    const skillGroupDtos = skillGroupsPageDto;

    it('should return list skills of the current user', async () => {
      jest
        .spyOn(mockUserService, 'findUserById')
        .mockResolvedValueOnce(userEntity);
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(userSkills),
            }) as never,
        );
      jest
        .spyOn(mockSkillGroupService, 'getSkillGroupQueryBuilderByOrderBy')
        .mockImplementationOnce(
          () =>
            ({
              paginate: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve([skillGroups, skillGroupDtos.meta]),
                ),
            }) as never,
        );

      const result = await skillService.getSkillsByUserId(
        pageOptions,
        userEntity.id,
      );

      expect(result.data[0].id).toEqual(skillGroupDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillGroupDtos.data[0].name);

      expect(mockUserService.findUserById).toBeCalledWith(userEntity.id);
      expect(userSkillRepository.createQueryBuilder).toBeCalled();
      expect(
        mockSkillGroupService.getSkillGroupQueryBuilderByOrderBy,
      ).toBeCalled();
    });
  });

  describe('createSkill', () => {
    const createSkill = { ...createSkillDto } as CreateSkillDto;

    it('should create skill', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as never,
      );
      jest.spyOn(mockSkillMapper, 'toSkillEntity').mockResolvedValueOnce(skill);
      jest.spyOn(skillRepository, 'save').mockResolvedValueOnce(skill);

      const result = await skillService.createSkill(createSkill);

      expect(result.id).toEqual(skill.id);
      expect(result.name).toEqual(skill.name);

      expect(skillRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillMapper.toSkillEntity).toBeCalled();
      expect(skillRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if skill is existing', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(skill),
          }) as never,
      );

      await expect(skillService.createSkill(createSkill)).rejects.toThrowError(
        BadRequestException,
      );

      expect(skillRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if skill group not found', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as never,
      );
      jest
        .spyOn(mockSkillMapper, 'toSkillEntity')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND);
        });

      await expect(skillService.createSkill(createSkill)).rejects.toThrowError(
        InvalidNotFoundException,
      );

      expect(skillRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillMapper.toSkillEntity).toBeCalled();
    });
  });

  describe('updateSkill', () => {
    const updateSkill = { ...updateSkillDto } as UpdateSkillDto;

    it('should update skill', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as never,
      );
      jest
        .spyOn(mockSkillMapper, 'toSkillEntityFromId')
        .mockResolvedValueOnce(skill);
      jest
        .spyOn(mockSkillMapper, 'toSkillEntityToUpdate')
        .mockResolvedValueOnce(skill);
      jest.spyOn(skillRepository, 'save').mockResolvedValueOnce(skill);

      const result = await skillService.updateSkill(skill.id, updateSkill);

      expect(result.id).toEqual(skill.id);
      expect(result.name).toEqual(skill.name);

      expect(skillRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillMapper.toSkillEntityFromId).toBeCalled();
      expect(mockSkillMapper.toSkillEntityToUpdate).toBeCalled();
      expect(skillRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if skill is existing', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(skill),
          }) as never,
      );

      await expect(
        skillService.updateSkill(skill.id, updateSkill),
      ).rejects.toThrowError(BadRequestException);

      expect(skillRepository.createQueryBuilder).toBeCalled();
    });

    it('should throw InvalidNotFoundException if skill not found', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as never,
      );
      jest
        .spyOn(mockSkillMapper, 'toSkillEntityFromId')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.SKILL_NOT_FOUND);
        });

      await expect(
        skillService.updateSkill(skill.id, updateSkill),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(skillRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillMapper.toSkillEntityFromId).toBeCalled();
    });

    it('should throw InvalidNotFoundException if skill group not found', async () => {
      jest.spyOn(skillRepository, 'createQueryBuilder').mockImplementationOnce(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as never,
      );
      jest
        .spyOn(mockSkillMapper, 'toSkillEntityFromId')
        .mockResolvedValueOnce(skill);
      jest
        .spyOn(mockSkillMapper, 'toSkillEntityToUpdate')
        .mockImplementationOnce(() => {
          throw new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND);
        });

      await expect(
        skillService.updateSkill(skill.id, updateSkill),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(skillRepository.createQueryBuilder).toBeCalled();
      expect(mockSkillMapper.toSkillEntityFromId).toBeCalled();
      expect(mockSkillMapper.toSkillEntityToUpdate).toBeCalled();
    });
  });

  describe('updateSkills', () => {
    const userSkillLevelZero = { ...userSkill, level: 0 } as UserSkillEntity;
    const existedUserSkill = [userSkill, userSkillLevelZero];

    it('should update skills of user by groupId', async () => {
      const updateSkill = { ...updateMySkillDto };

      jest
        .spyOn(mockSkillGroupService, 'findSkillGroupById')
        .mockResolvedValueOnce(skillGroup);
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(existedUserSkill),
            }) as never,
        );
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(userSkill),
            }) as never,
        );
      jest.spyOn(userSkillRepository, 'save').mockResolvedValueOnce(userSkill);

      const result = await skillService.updateSkills(
        skillGroup.id,
        userEntity.id,
        updateSkill,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user.id).toEqual(userSkills[0].user.id);

      expect(mockSkillGroupService.findSkillGroupById).toBeCalledWith(
        skillGroup.id,
      );
      expect(userSkillRepository.createQueryBuilder).toBeCalledTimes(2);
      expect(userSkillRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if skill group not found', async () => {
      const updateSkill = { ...updateMySkillDto };

      jest
        .spyOn(mockSkillGroupService, 'findSkillGroupById')
        .mockRejectedValue(
          new InvalidNotFoundException(ErrorCode.SKILL_GROUP_NOT_FOUND),
        );

      await expect(
        skillService.updateSkills(skillGroup.id, userEntity.id, updateSkill),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(mockSkillGroupService.findSkillGroupById).toBeCalledWith(
        skillGroup.id,
      );
    });

    it('should throw BadRequestException if invalid skillId(s) in request', async () => {
      const errorSkill = {
        ...updateSkillLevelDto,
        skillId: 2,
      } as UpdateSkillLevelDto;
      const updateError = {
        ...updateMySkillDto,
        skills: [...updateMySkillDto.skills, errorSkill],
      };

      jest
        .spyOn(mockSkillGroupService, 'findSkillGroupById')
        .mockImplementationOnce(() => Promise.resolve(skillGroup));

      await expect(
        skillService.updateSkills(skillGroup.id, userEntity.id, updateError),
      ).rejects.toThrowError(BadRequestException);

      expect(mockSkillGroupService.findSkillGroupById).toBeCalledWith(
        skillGroup.id,
      );
    });

    it('should throw BadRequestException if missing skillId(s) in request', async () => {
      const updateSkill = { ...updateMySkillDto } as UpdateMySkillDto;
      const missingSkill = { ...skillEntity, id: 2 } as SkillEntity;
      const errorSkillGroup = { ...skillGroup } as SkillGroupEntity;
      errorSkillGroup.skills.push(missingSkill);

      jest
        .spyOn(mockSkillGroupService, 'findSkillGroupById')
        .mockImplementationOnce(() => Promise.resolve(errorSkillGroup));

      await expect(
        skillService.updateSkills(skillGroup.id, userEntity.id, updateSkill),
      ).rejects.toThrowError(BadRequestException);

      expect(mockSkillGroupService.findSkillGroupById).toBeCalledWith(
        skillGroup.id,
      );
    });

    it('should throw BadRequestException if duplicate skillId(s) found in request', async () => {
      const errorSkill = {
        ...updateSkillLevelDto,
        skillId: 1,
      } as UpdateSkillLevelDto;
      const updateError = {
        ...updateMySkillDto,
        skills: [...updateMySkillDto.skills, errorSkill],
      };

      jest
        .spyOn(mockSkillGroupService, 'findSkillGroupById')
        .mockImplementationOnce(() => Promise.resolve(skillGroup));

      await expect(
        skillService.updateSkills(skillGroup.id, userEntity.id, updateError),
      ).rejects.toThrowError(BadRequestException);

      expect(mockSkillGroupService.findSkillGroupById).toBeCalledWith(
        skillGroup.id,
      );
    });
  });

  describe('updateToggleSkill', () => {
    it('should update tick/untick checkbox for my skill by skill id', async () => {
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(userSkill),
            }) as never,
        );
      jest
        .spyOn(userSkillRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(userSkill));

      const result = await skillService.updateToggleSkill(
        skill.id,
        userEntity.id,
      );

      expect(result.id).toEqual(userSkill.id);
      expect(result.skill.name).toEqual(userSkill.skill.name);

      expect(userSkillRepository.createQueryBuilder).toBeCalled();
      expect(userSkillRepository.save).toBeCalled();
    });

    it('should throw InvalidNotFoundException if user skill not found', async () => {
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            }) as never,
        );

      await expect(
        skillService.updateToggleSkill(skill.id, userEntity.id),
      ).rejects.toThrowError(InvalidNotFoundException);

      expect(userSkillRepository.createQueryBuilder).toBeCalled();
    });
  });

  describe('updateToggleGroupSkills', () => {
    it('should update tick checkbox for group of skills', async () => {
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValueOnce(userSkills),
            }) as never,
        );
      jest
        .spyOn(userSkillRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve(userSkill));

      const result = await skillService.updateToggleGroupSkills(
        skillGroup.id,
        userEntity.id,
        true,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].skill.name).toEqual(userSkills[0].skill.name);

      expect(userSkillRepository.createQueryBuilder).toBeCalled();
      expect(userSkillRepository.save).toBeCalled();
    });

    it('should throw BadRequestException if user skill not found', async () => {
      jest
        .spyOn(userSkillRepository, 'createQueryBuilder')
        .mockImplementationOnce(
          () =>
            ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValueOnce([] as UserSkillEntity[]),
            }) as never,
        );

      await expect(
        skillService.updateToggleGroupSkills(
          skillGroup.id,
          userEntity.id,
          true,
        ),
      ).rejects.toThrowError(BadRequestException);

      expect(userSkillRepository.createQueryBuilder).toBeCalled();
    });
  });
});
