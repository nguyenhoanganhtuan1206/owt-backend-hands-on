import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { UserSkillEntity } from '../entities/user-skill.entity';
import { SkillDto } from './skill.dto';

export class UserSkillDto extends AbstractDto {
  @ApiPropertyOptional()
  user: UserDto;

  @ApiPropertyOptional()
  skill: SkillDto;

  @ApiPropertyOptional()
  level: number;

  @ApiPropertyOptional()
  isSelected: boolean;

  constructor(userSkillEntity: UserSkillEntity) {
    super(userSkillEntity);
    this.user = userSkillEntity.user.toDto();
    this.skill = userSkillEntity.skill.toDto();
    this.level = userSkillEntity.level;
    this.isSelected = userSkillEntity.isSelected;
  }
}
