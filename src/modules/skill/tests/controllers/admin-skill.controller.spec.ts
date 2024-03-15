import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SkillGroupService } from '../../../skill-group/services/skill-group.service';
import {
  skillGroupDto,
  skillGroupsPageDto,
  skillGroupsPageOptionsDto,
} from '../../../skill-group/tests/fakes/skill-group.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import { AdminSkillController } from '../../controllers/admin-skill.controller';
import { SkillService } from '../../services/skill.service';
import {
  createSkillDto,
  skillDto,
  skillsPageDto,
  skillsPageOptionsDto,
  updateMySkillDto,
  updateSkillDto,
  userSkillDto,
} from '../fakes/skill.fake';

describe('AdminSkillController', () => {
  let adminSkillController: AdminSkillController;

  const user = UserFake.buildUserDto();
  const skill = skillDto;
  const skillGroup = skillGroupDto;
  const skillGroups = [skillGroup];
  const userSkill = userSkillDto;
  const userSkills = [userSkill];

  const mockSkillService = {
    getAllSkills: jest.fn(),
    searchSkills: jest.fn(),
    getSkillsByUserId: jest.fn(),
    updateSkills: jest.fn(),
    createSkill: jest.fn(),
    updateSkill: jest.fn(),
    updateToggleSkill: jest.fn(),
    updateToggleGroupSkills: jest.fn(),
  };
  const mockSkillGroupService = {
    searchSkills: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSkillController],
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

    adminSkillController =
      module.get<AdminSkillController>(AdminSkillController);
  });

  describe('getAllSkills', () => {
    const pageOptions = skillsPageOptionsDto;
    const skillDtos = skillsPageDto;

    it('should return all skills', async () => {
      jest
        .spyOn(mockSkillService, 'getAllSkills')
        .mockReturnValueOnce(skillDtos);

      const result = await adminSkillController.getAllSkills(pageOptions);

      expect(result.data[0].id).toEqual(skillDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillDtos.data[0].name);

      expect(mockSkillService.getAllSkills).toBeCalled();
    });
  });

  describe('searchSkills', () => {
    const name = 'skill';

    it('should Search skills', async () => {
      jest
        .spyOn(mockSkillGroupService, 'searchSkills')
        .mockReturnValueOnce(skillGroups);

      const result = await adminSkillController.searchSkills(name);

      expect(result[0].id).toEqual(skillGroups[0].id);
      expect(result[0].name).toEqual(skillGroups[0].name);
      expect(result[0].skills).toEqual(skillGroups[0].skills);

      expect(mockSkillGroupService.searchSkills).toBeCalledWith(name);
    });
  });

  describe('getSkillsByUserId', () => {
    const pageOptions = skillGroupsPageOptionsDto;
    const skillGroupDtos = skillGroupsPageDto;

    it('should return ist of skills by user id', async () => {
      jest
        .spyOn(mockSkillService, 'getSkillsByUserId')
        .mockReturnValueOnce(skillGroupDtos);

      const result = await adminSkillController.getSkillsByUserId(
        pageOptions,
        user.id,
      );

      expect(result.data[0].id).toEqual(skillGroupDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillGroupDtos.data[0].name);
      expect(result.data[0].skills).toEqual(skillGroupDtos.data[0].skills);

      expect(mockSkillService.getSkillsByUserId).toBeCalled();
    });
  });

  describe('updateSkills', () => {
    const updateSkill = updateMySkillDto;

    it('should update skills by group id and user id', async () => {
      jest
        .spyOn(mockSkillService, 'updateSkills')
        .mockReturnValueOnce(userSkills);

      const result = await adminSkillController.updateSkills(
        skillGroup.id,
        user.id,
        updateSkill,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user).toEqual(userSkills[0].user);
      expect(result[0].skill).toEqual(userSkills[0].skill);
      expect(result[0].level).toEqual(userSkills[0].level);

      expect(mockSkillService.updateSkills).toBeCalled();
    });
  });

  describe('createSkill', () => {
    const createSkill = createSkillDto;

    it('should create skill', async () => {
      jest.spyOn(mockSkillService, 'createSkill').mockReturnValueOnce(skill);

      const result = await adminSkillController.createSkill(createSkill);

      expect(result.id).toEqual(skill.id);
      expect(result.name).toEqual(skill.name);

      expect(mockSkillService.createSkill).toBeCalled();
    });
  });

  describe('updateSkill', () => {
    const updateSkill = updateSkillDto;

    it('should update skill', async () => {
      jest.spyOn(mockSkillService, 'updateSkill').mockReturnValueOnce(skill);

      const result = await adminSkillController.updateSkill(
        skill.id,
        updateSkill,
      );

      expect(result.id).toEqual(skill.id);
      expect(result.name).toEqual(skill.name);

      expect(mockSkillService.updateSkill).toBeCalled();
    });
  });

  describe('updateToggleSkill', () => {
    const unSelectedSkill = {
      ...userSkillDto,
      isSelected: false,
    };

    it('should update tick/untick checkbox for skill by user id and skill id', async () => {
      jest
        .spyOn(mockSkillService, 'updateToggleSkill')
        .mockReturnValueOnce(unSelectedSkill);

      const result = await adminSkillController.updateToggleSkill(
        user.id,
        skill.id,
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

      const result = await adminSkillController.checkToggleGroupSkills(
        skillGroup.id,
        user.id,
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

      const result = await adminSkillController.uncheckToggleGroupSkills(
        skillGroup.id,
        user.id,
      );

      expect(result[0].id).toEqual(userSkills[0].id);
      expect(result[0].user).toEqual(userSkills[0].user);
      expect(result[0].skill).toEqual(userSkills[0].skill);
      expect(result[0].level).toEqual(userSkills[0].level);

      expect(mockSkillService.updateToggleGroupSkills).toBeCalled();
    });
  });
});
