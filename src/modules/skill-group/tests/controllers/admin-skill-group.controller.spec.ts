import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { skillWithLevelDto } from '../../../skill/tests/fakes/skill.fake';
import { AdminSkillGroupController } from '../../controllers/admin-skill-group.controller';
import type { SkillGroupDto } from '../../dtos/skill-group.dto';
import { SkillGroupService } from '../../services/skill-group.service';
import {
  createSkillGroupDto,
  skillGroupDto,
  skillGroupsPageDto,
  skillGroupsPageOptionsDto,
  updateSkillGroupDto,
} from '../fakes/skill-group.fake';

describe('AdminSkillGroupController', () => {
  let adminSkillGroupController: AdminSkillGroupController;

  const skillGroup = {
    ...skillGroupDto,
    skills: [skillWithLevelDto],
  } as SkillGroupDto;

  const mockSkillGroupService = {
    getAllSkillGroups: jest.fn(),
    createSkillGroup: jest.fn(),
    updateSkillGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSkillGroupController],
      providers: [
        {
          provide: SkillGroupService,
          useValue: mockSkillGroupService,
        },
      ],
    }).compile();

    adminSkillGroupController = module.get<AdminSkillGroupController>(
      AdminSkillGroupController,
    );
  });

  describe('getAllSkillGroups', () => {
    const pageOptions = skillGroupsPageOptionsDto;
    const skillGroupDtos = skillGroupsPageDto;

    it('should return all skill groups', async () => {
      jest
        .spyOn(mockSkillGroupService, 'getAllSkillGroups')
        .mockReturnValueOnce(skillGroupDtos);

      const result =
        await adminSkillGroupController.getAllSkillGroups(pageOptions);

      expect(result.data[0].id).toEqual(skillGroupDtos.data[0].id);
      expect(result.data[0].name).toEqual(skillGroupDtos.data[0].name);
      expect(result.data[0].skills).toEqual(skillGroupDtos.data[0].skills);

      expect(mockSkillGroupService.getAllSkillGroups).toBeCalled();
    });
  });

  describe('createSkillGroup', () => {
    const createSkillGroup = { ...createSkillGroupDto };

    it('should create skill group', async () => {
      jest
        .spyOn(mockSkillGroupService, 'createSkillGroup')
        .mockReturnValueOnce(skillGroup);

      const result =
        await adminSkillGroupController.createSkillGroup(createSkillGroup);

      expect(result.id).toEqual(skillGroup.id);
      expect(result.name).toEqual(skillGroup.name);
      expect(result.skills).toEqual(skillGroup.skills);

      expect(mockSkillGroupService.createSkillGroup).toBeCalled();
    });
  });

  describe('updateSkillGroup', () => {
    const updateSkillGroup = { ...updateSkillGroupDto };

    it('should create skill group', async () => {
      jest
        .spyOn(mockSkillGroupService, 'updateSkillGroup')
        .mockReturnValueOnce(skillGroup);

      const result = await adminSkillGroupController.updateSkillGroup(
        skillGroup.id,
        updateSkillGroup,
      );

      expect(result.id).toEqual(skillGroup.id);
      expect(result.name).toEqual(skillGroup.name);
      expect(result.skills).toEqual(skillGroup.skills);

      expect(mockSkillGroupService.updateSkillGroup).toBeCalled();
    });
  });
});
