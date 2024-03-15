import type { PageDto } from 'common/dto/page.dto';

import { Order } from '../../../../constants';
import { SkillGroupEntity } from '../../../skill-group/entities/skill-group.entity';
import { skillGroupDto } from '../../../skill-group/tests/fakes/skill-group.fake';
import { UserFake } from '../../../user/tests/fakes/user.fake';
import type { CreateSkillDto } from '../../dtos/create-skill.dto';
import type { SkillDto } from '../../dtos/skill.dto';
import type { SkillPageOptionsDto } from '../../dtos/skill-page-options.dto';
import type { SkillWithLevelDto } from '../../dtos/skill-with-level.dto';
import type UpdateMySkillDto from '../../dtos/update-my-skill.dto';
import type { UpdateSkillDto } from '../../dtos/update-skill.dto';
import type { UpdateSkillLevelDto } from '../../dtos/update-skill-level.dto';
import type { UserSkillDto } from '../../dtos/user-skill.dto';
import type { SkillEntity } from '../../entities/skill.entity';
import type { UserSkillEntity } from '../../entities/user-skill.entity';

export const skillDto: SkillDto = {
  id: 1,
  name: 'name',
  createdAt: new Date('2024-01-24 09:57:42.195356'),
  updatedAt: new Date('2024-01-24 09:57:42.195356'),
  group: skillGroupDto,
};

export const skillEntity: SkillEntity = {
  name: skillDto.name,
  group: new SkillGroupEntity(),
  id: skillDto.id,
  createdAt: skillDto.createdAt,
  updatedAt: skillDto.updatedAt,
  toDto(): SkillDto {
    return skillDto;
  },
};

export const skillDtoFromSkillWithLevelDto = (
  skill: SkillWithLevelDto,
): SkillDto => ({
  id: skill.id,
  name: skill.name,
  createdAt: skill.createdAt,
  updatedAt: skill.updatedAt,
});

export const skillWithLevelDto: SkillWithLevelDto = {
  id: 1,
  name: 'name',
  createdAt: skillDto.createdAt,
  updatedAt: skillDto.updatedAt,
  level: 5,
  isSelected: true,
};

export const userSkillDto: UserSkillDto = {
  id: 1,
  user: UserFake.buildUserDto(),
  skill: skillDto,
  level: 5,
  isSelected: true,
  createdAt: skillDto.createdAt,
  updatedAt: skillDto.updatedAt,
};

export const userSkillEntity: UserSkillEntity = {
  id: userSkillDto.id,
  user: UserFake.buildUserEntity(userSkillDto.user),
  skill: skillEntity,
  level: userSkillDto.level,
  toDto(): UserSkillDto {
    return { ...userSkillDto, level: this.level };
  },
  isSelected: true,
  createdAt: skillDto.createdAt,
  updatedAt: skillDto.updatedAt,
};

export const updateSkillLevelDto: UpdateSkillLevelDto = {
  skillId: 1,
  level: 5,
};

export const updateMySkillDto: UpdateMySkillDto = {
  skills: [updateSkillLevelDto],
};

export const createSkillDto: CreateSkillDto = {
  name: 'name',
  groupId: 1,
};

export const updateSkillDto: UpdateSkillDto = {
  name: 'name',
  groupId: 1,
};

export const skillsPageOptionsDto: SkillPageOptionsDto = {
  orderBy: Order.ASC,
  page: 1,
  take: 10,
  query: 'search',
  skip: 0,
  sortColumn: 'date',
  name: 'skill',
};

export const skillsPageDto: PageDto<SkillDto> = {
  data: [skillDto],
  meta: {
    page: 1,
    take: 1,
    itemCount: 1,
    pageCount: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};
