import type { PageDto } from 'common/dto/page.dto';

import { Order } from '../../../../constants';
import {
  skillEntity,
  skillWithLevelDto,
} from '../../../skill/tests/fakes/skill.fake';
import type { CreateSkillGroupDto } from '../../dtos/create-skill-group.dto';
import type { SkillGroupDto } from '../../dtos/skill-group.dto';
import type { SkillGroupsPageOptionsDto } from '../../dtos/skill-groups-page-options.dto';
import type { UpdateSkillGroupDto } from '../../dtos/update-skill-group.dto';
import type { SkillGroupEntity } from '../../entities/skill-group.entity';

export const skillGroupDto: SkillGroupDto = {
  id: 1,
  name: 'name',
  createdAt: new Date('2024-01-24 09:57:42.195356'),
  updatedAt: new Date('2024-01-24 09:57:42.195356'),
  skills: [skillWithLevelDto],
};

export const skillGroupEntity: SkillGroupEntity = {
  name: skillGroupDto.name,
  id: skillGroupDto.id,
  createdAt: skillGroupDto.createdAt,
  updatedAt: skillGroupDto.updatedAt,
  toDto(): SkillGroupDto {
    return skillGroupDto;
  },
  skills: [skillEntity],
};

export const skillGroupsPageOptionsDto: SkillGroupsPageOptionsDto = {
  orderBy: Order.ASC,
  page: 1,
  take: 10,
  query: 'search',
  skip: 0,
  sortColumn: 'date',
  name: 'skillGroup',
};

export const skillGroupsPageDto: PageDto<SkillGroupDto> = {
  data: [skillGroupDto],
  meta: {
    page: 1,
    take: 1,
    itemCount: 1,
    pageCount: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const createSkillGroupDto: CreateSkillGroupDto = {
  name: 'name',
};

export const updateSkillGroupDto: UpdateSkillGroupDto = {
  name: 'name',
};
