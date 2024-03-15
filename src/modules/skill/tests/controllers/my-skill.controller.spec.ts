import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SkillGroupService } from '../../../skill-group/services/skill-group.service';
import {
  skillGroupDto,
  skillGroupsPageDto,
  skillGroupsPageOptionsDto,
} from '../../../skill-group/tests/fakes/skill-group.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { MySkillController } from '../../controllers/my-skill.controller';
import { SkillService } from '../../services/skill.service';
import { skillDto, updateMySkillDto, userSkillDto } from '../fakes/skill.fake';

describe('MySkillController', () => {
  let mySkillController: MySkillController;

  const user = UserFake.buildUserDto();
  const userEntity = UserFake.buildUserEntity(user);
  const skill = skillDto;
  const skillGroup = skillGroupDto;
  const skillGroups = [skillGroup];
  const userSkill = userSkillDto;
  const userSkills = [userSkill];

  const mockSkillService = {
    getSkillsByUserId: jest.fn(),
    updateSkills: jest.fn(),
    updateToggleSkill: jest.fn(),
    updateToggleGroupSkills: jest.fn(),
  };
  const mockSkillGroupService = {
    searchSkills: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MySkillController],
      providers: [
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: SkillGroupService,
          useValue: mockSkillGroupService,
        },
      ],
    }).compile();

    mySkillController = module.get<MySkillController>(MySkillController);
  });

  describe('getMySkills', () => {
    const pageOptions = skillGroupsPageOptionsDto;
    const skillGroupDtos = skillGroupsPageDto;

    it('should return list skills of the current user', async () => {
      jest
        .spyOn(mockSkillService, 'getSkillsByUserId')
        .mockReturnValueOnce(skillGroupDtos);

      const result = await mySkillController.getMySkills(
        pageOptions,
        userEntity,
      );

      expect(result.data[0].id).toEqual(skillGroupDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillGroupDtos.data[0].name);
      expect(result.data[0].skills).toEqual(skillGroupDtos.data[0].skills);

      expect(mockSkillService.getSkillsByUserId).toBeCalled();
    });
  });

  describe('searchMySkills', () => {
    const name = 'skill';

    it('should return list skills of the current user by name', async () => {
      jest
        .spyOn(mockSkillGroupService, 'searchSkills')
        .mockReturnValueOnce(skillGroups);

      const result = await mySkillController.searchMySkills(name);

      expect(result[0].id).toEqual(skillGroups[0].id);
      expect(result[0].name).toEqual(skillGroups[0].name);
      expect(result[0].skills).toEqual(skillGroups[0].skills);

      expect(mockSkillGroupService.searchSkills).toBeCalledWith(name);
    });
  });

  describe('updateMySkills', () => {
    const updateSkill = updateMySkillDto;

    it('should update skills of user by groupId', async () => {
      jest
        .spyOn(mockSkillService, 'updateSkills')
        .mockReturnValueOnce(userSkills);

      const result = await mySkillController.updateMySkills(
        skillGroup.id,
        userEntity,
        updateSkill,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user).toEqual(userSkills[0].user);
      expect(result[0].skill).toEqual(userSkills[0].skill);
      expect(result[0].level).toEqual(userSkills[0].level);

      expect(mockSkillService.updateSkills).toBeCalled();
    });
  });

  describe('updateToggleSkill', () => {
    const unSelectedSkill = {
      ...userSkillDto,
      isSelected: false,
    };

    it('should update tick/untick checkbox for my skill by skill id', async () => {
      jest
        .spyOn(mockSkillService, 'updateToggleSkill')
        .mockReturnValueOnce(unSelectedSkill);

      const result = await mySkillController.updateToggleSkill(
        skill.id,
        userEntity,
      );

      expect(result.id).toEqual(unSelectedSkill.id);
      expect(result.isSelected).toEqual(unSelectedSkill.isSelected);

      expect(mockSkillService.updateToggleSkill).toBeCalled();
    });
  });

  describe('checkToggleGroupSkills', () => {
    it('should update tick checkbox for group of skills', async () => {
      jest
        .spyOn(mockSkillService, 'updateToggleGroupSkills')
        .mockReturnValueOnce(userSkills);

      const result = await mySkillController.checkToggleGroupSkills(
        skillGroup.id,
        userEntity,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user).toEqual(userSkills[0].user);
      expect(result[0].skill).toEqual(userSkills[0].skill);
      expect(result[0].level).toEqual(userSkills[0].level);

      expect(mockSkillService.updateToggleGroupSkills).toBeCalled();
    });
  });

  describe('uncheckToggleGroupSkills', () => {
    it('should update untick checkbox for group of skills', async () => {
      jest
        .spyOn(mockSkillService, 'updateToggleGroupSkills')
        .mockReturnValueOnce(userSkills);

      const result = await mySkillController.uncheckToggleGroupSkills(
        skillGroup.id,
        userEntity,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user).toEqual(userSkills[0].user);
      expect(result[0].skill).toEqual(userSkills[0].skill);
      expect(result[0].level).toEqual(userSkills[0].level);

      expect(mockSkillService.updateToggleGroupSkills).toBeCalled();
    });
  });
});
